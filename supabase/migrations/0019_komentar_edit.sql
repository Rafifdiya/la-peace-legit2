-- =================================================================
-- Jejak Jajan - Komentar jajanan + edit kontribusi & forum milik sendiri
-- Jalankan setelah 0018 di Supabase Dashboard > SQL Editor.
-- Vote kelangkaan tidak butuh migration (tabel rarity_votes sudah ada sejak 0001).
-- =================================================================

-- ---------- Komentar di halaman jajanan ----------
-- Balasan cukup 1 tingkat: parent_id menunjuk komentar utama.
create table if not exists snack_comments (
  id uuid primary key default gen_random_uuid(),
  snack_id uuid not null references snacks (id) on delete cascade,
  parent_id uuid references snack_comments (id) on delete cascade,
  user_id uuid references profiles (id) on delete cascade default auth.uid(),
  isi text not null check (char_length(isi) between 1 and 1000),
  created_at timestamptz not null default now(),
  diedit_at timestamptz
);
create index if not exists snack_comments_snack_idx on snack_comments (snack_id, created_at);

alter table snack_comments enable row level security;

drop policy if exists "baca komentar" on snack_comments;
create policy "baca komentar" on snack_comments for select using (true);

drop policy if exists "tulis komentar" on snack_comments;
create policy "tulis komentar" on snack_comments for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from snacks s where s.id = snack_id and s.status = 'approved')
    and (parent_id is null or exists (
      select 1 from snack_comments p where p.id = parent_id and p.parent_id is null and p.snack_id = snack_comments.snack_id))
  );

drop policy if exists "edit komentar sendiri" on snack_comments;
create policy "edit komentar sendiri" on snack_comments for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "hapus komentar sendiri atau admin" on snack_comments;
create policy "hapus komentar sendiri atau admin" on snack_comments for delete to authenticated
  using (user_id = (select auth.uid()) or is_admin());

-- Yang boleh diubah hanya isi & penanda edit
revoke update on snack_comments from anon, authenticated;
grant update (isi, diedit_at) on snack_comments to authenticated;

-- ---------- Edit postingan & balasan forum (pemilik saja) ----------
alter table requests add column if not exists diedit_at timestamptz;
alter table request_answers add column if not exists diedit_at timestamptz;

create or replace function edit_postingan(p_id uuid, p_judul text, p_deskripsi text, p_topik text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if char_length(trim(p_judul)) not between 3 and 100 then
    raise exception 'Judul 3-100 karakter';
  end if;
  update public.requests
     set judul = trim(p_judul),
         deskripsi = nullif(trim(p_deskripsi), ''),
         topik = coalesce(nullif(p_topik, ''), topik),
         diedit_at = now()
   where id = p_id and created_by = auth.uid();
  if not found then
    raise exception 'Hanya pemilik yang bisa mengedit postingan ini';
  end if;
end;
$$;

create or replace function edit_balasan(p_id uuid, p_isi text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if char_length(trim(p_isi)) not between 3 and 1000 then
    raise exception 'Balasan 3-1000 karakter';
  end if;
  update public.request_answers set isi = trim(p_isi), diedit_at = now()
   where id = p_id and user_id = auth.uid();
  if not found then
    raise exception 'Hanya pemilik yang bisa mengedit balasan ini';
  end if;
end;
$$;

-- ---------- Edit kontribusi jajanan (pemilik saja) ----------
-- Hanya teks: nama, nama lain, deskripsi, cerita, daerah, sumber, resep & langkah.
-- Kiriman yang ditolak kembali "pending" untuk dicek ulang admin.
-- Foto langkah & video per langkah dipertahankan sesuai urutan.
alter table snacks add column if not exists diedit_at timestamptz;

create or replace function edit_jajanan(p_slug text, data jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_snack uuid;
  v_status public.content_status;
  v_recipe uuid;
  lama jsonb;
  langkah text;
  i int := 0;
begin
  select id, status into v_snack, v_status from public.snacks
   where slug = p_slug and created_by = uid;
  if v_snack is null then
    raise exception 'Hanya pengirim yang bisa mengedit jajanan ini';
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
    status = case when v_status = 'rejected' then 'pending' else v_status end,
    diedit_at = now(),
    updated_at = now()
  where id = v_snack;

  -- Resep milik pengirim (versi pertama)
  select id into v_recipe from public.recipes
   where snack_id = v_snack and created_by = uid order by created_at limit 1;
  if v_recipe is not null and data ? 'resep' then
    update public.recipes set
      bahan = coalesce(data -> 'resep' -> 'bahan', bahan),
      porsi = nullif(data -> 'resep' ->> 'porsi', '')::smallint,
      waktu_menit = nullif(data -> 'resep' ->> 'waktuMenit', '')::smallint,
      kesulitan = nullif(data -> 'resep' ->> 'kesulitan', '')::public.difficulty,
      video_url = nullif(trim(data -> 'resep' ->> 'videoUrl'), ''),
      status = case when status = 'rejected' then 'pending' else status end
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

revoke execute on function edit_postingan(uuid, text, text, text) from public, anon;
revoke execute on function edit_balasan(uuid, text) from public, anon;
revoke execute on function edit_jajanan(text, jsonb) from public, anon;
grant execute on function edit_postingan(uuid, text, text, text) to authenticated;
grant execute on function edit_balasan(uuid, text) to authenticated;
grant execute on function edit_jajanan(text, jsonb) to authenticated;
