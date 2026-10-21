-- =================================================================
-- Jejak Jajan - Perbaikan balasan komentar + edit hanya setelah disetujui
-- Jalankan setelah 0019 di Supabase Dashboard > SQL Editor.
-- =================================================================

-- Di 0019, "parent_id" di dalam subquery terbaca sebagai kolom komentar induk
-- (p.parent_id), bukan kolom baris baru, sehingga semua balasan ditolak RLS.
-- Cek induk dipindah ke fungsi agar nilai baris baru jelas.
create or replace function komentar_induk_valid(p_parent uuid, p_snack uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_parent is null or exists (
    select 1 from public.snack_comments c
    where c.id = p_parent and c.parent_id is null and c.snack_id = p_snack
  );
$$;

drop policy if exists "tulis komentar" on snack_comments;
create policy "tulis komentar" on snack_comments for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from snacks s where s.id = snack_comments.snack_id and s.status = 'approved')
    and komentar_induk_valid(snack_comments.parent_id, snack_comments.snack_id)
  );

-- Edit kontribusi hanya untuk jajanan yang sudah disetujui
-- (mencegah bentrok: admin menyetujui, lalu pengirim menyimpan editan lama).
create or replace function edit_jajanan(p_slug text, data jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_snack uuid;
  v_recipe uuid;
  lama jsonb;
  langkah text;
  i int := 0;
begin
  select id into v_snack from public.snacks
   where slug = p_slug and created_by = uid and status = 'approved';
  if v_snack is null then
    raise exception 'Hanya pengirim yang bisa mengedit, dan hanya setelah disetujui admin';
  end if;
  if char_length(trim(data ->> 'nama')) not between 2 and 80 then
    raise exception 'Nama 2-80 karakter';
  end if;

  update public.snacks set
    nama = trim(data ->> 'nama'),
    nama_lain = coalesce(array(select trim(x) from jsonb_array_elements_text(data -> 'namaLain') x where trim(x) <> ''), '{}'),
    deskripsi_singkat = left(nullif(trim(data ->> 'deskripsi'), ''), 200),
    cerita = nullif(trim(data ->> 'cerita'), ''),
    daerah_detail = nullif(trim(data ->> 'daerah'), ''),
    sumber_info = nullif(trim(data ->> 'sumber'), ''),
    diedit_at = now(),
    updated_at = now()
  where id = v_snack;

  select id into v_recipe from public.recipes
   where snack_id = v_snack and created_by = uid order by created_at limit 1;
  if v_recipe is not null and data ? 'resep' then
    update public.recipes set
      bahan = coalesce(data -> 'resep' -> 'bahan', bahan),
      porsi = nullif(data -> 'resep' ->> 'porsi', '')::smallint,
      waktu_menit = nullif(data -> 'resep' ->> 'waktuMenit', '')::smallint,
      kesulitan = nullif(data -> 'resep' ->> 'kesulitan', '')::public.difficulty,
      video_url = nullif(trim(data -> 'resep' ->> 'videoUrl'), '')
    where id = v_recipe;

    if jsonb_array_length(coalesce(data -> 'resep' -> 'langkah', '[]')) > 0 then
      select coalesce(jsonb_agg(jsonb_build_object('foto', foto_url, 'video', video_url) order by urutan), '[]')
        into lama from public.recipe_steps where recipe_id = v_recipe;
      delete from public.recipe_steps where recipe_id = v_recipe;
      for langkah in select jsonb_array_elements_text(data -> 'resep' -> 'langkah') loop
        if trim(langkah) <> '' then
          i := i + 1;
          insert into public.recipe_steps (recipe_id, urutan, instruksi, foto_url, video_url)
          values (v_recipe, i, trim(langkah), lama -> (i - 1) ->> 'foto', lama -> (i - 1) ->> 'video');
        end if;
      end loop;
    end if;
  end if;
end;
$$;
