-- =================================================================
-- Jejak Jajan - kirim jajanan (form upload) + moderasi admin
-- Jalankan setelah 0004 di Supabase Dashboard > SQL Editor.
-- =================================================================

-- Alasan penolakan, tampil ke pengirim di tab Status kiriman.
alter table snacks add column alasan_tolak text;

-- -----------------------------------------------------------------
-- kirim_jajanan: simpan 1 kiriman lengkap (jajanan + resep + langkah +
-- lokasi + vote) dalam satu transaksi. Gagal satu, batal semua.
-- security definer agar bisa cek slug yang bentrok dengan kiriman orang
-- lain (tidak terlihat lewat RLS); karena itu semua nilai sensitif
-- (status, created_by, verified) diisi di sini, bukan dari input.
-- -----------------------------------------------------------------
create function kirim_jajanan(data jsonb) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  v_slug text;
  v_snack uuid;
  v_recipe uuid;
  v_prov smallint;
  langkah jsonb;
  lok jsonb;
  i int := 0;
begin
  if uid is null then
    raise exception 'Harus masuk dulu';
  end if;

  v_prov := (select id from public.provinces where slug = data ->> 'provinsi');
  if v_prov is null then
    raise exception 'Provinsi tidak valid';
  end if;

  -- Slug dari nama; tambah akhiran acak kalau sudah dipakai.
  v_slug := trim(both '-' from regexp_replace(lower(data ->> 'nama'), '[^a-z0-9]+', '-', 'g'));
  if v_slug = '' then
    raise exception 'Nama tidak valid';
  end if;
  if exists (select 1 from public.snacks where slug = v_slug) then
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);
  end if;

  insert into public.snacks (slug, nama, nama_lain, province_id, daerah_detail, category_id,
                             deskripsi_singkat, cerita, sumber_info, cover_url, status, created_by)
  values (
    v_slug,
    trim(data ->> 'nama'),
    coalesce(array(select trim(x) from jsonb_array_elements_text(data -> 'namaLain') x where trim(x) <> ''), '{}'),
    v_prov,
    nullif(trim(data ->> 'daerah'), ''),
    (select id from public.categories where nama = data ->> 'kategori'),
    nullif(trim(data ->> 'deskripsi'), ''),
    nullif(trim(data ->> 'cerita'), ''),
    nullif(trim(data ->> 'sumber'), ''),
    nullif(data ->> 'cover', ''),
    'pending',
    uid
  )
  returning id into v_snack;

  -- Resep (opsional): hanya disimpan jika ada minimal 1 langkah.
  if jsonb_array_length(coalesce(data -> 'resep' -> 'langkah', '[]')) > 0 then
    insert into public.recipes (snack_id, judul_versi, bahan, porsi, waktu_menit, kesulitan, video_url, status, created_by)
    values (
      v_snack,
      coalesce(nullif(trim(data -> 'resep' ->> 'judulVersi'), ''), 'Versi rumahan'),
      coalesce(data -> 'resep' -> 'bahan', '[]'),
      nullif(data -> 'resep' ->> 'porsi', '')::smallint,
      nullif(data -> 'resep' ->> 'waktuMenit', '')::smallint,
      nullif(data -> 'resep' ->> 'kesulitan', '')::public.difficulty,
      nullif(trim(data -> 'resep' ->> 'videoUrl'), ''),
      'pending',
      uid
    )
    returning id into v_recipe;

    for langkah in select * from jsonb_array_elements(data -> 'resep' -> 'langkah') loop
      if trim(coalesce(langkah ->> 'instruksi', '')) <> '' then
        i := i + 1;
        insert into public.recipe_steps (recipe_id, urutan, instruksi, foto_url, video_url)
        values (v_recipe, i, trim(langkah ->> 'instruksi'),
                nullif(langkah ->> 'foto', ''), nullif(trim(langkah ->> 'videoUrl'), ''));
      end if;
    end loop;
  end if;

  -- Lokasi terlihat (opsional)
  lok := data -> 'lokasi';
  if lok is not null and trim(coalesce(lok ->> 'tempat', '')) <> '' then
    insert into public.sightings (snack_id, nama_tempat, area, province_id, jenis, maps_url,
                                  tanggal_terlihat, order_url, izin_publik, status, created_by)
    values (
      v_snack,
      trim(lok ->> 'tempat'),
      coalesce(nullif(trim(lok ->> 'area'), ''), (select nama from public.provinces where id = v_prov)),
      v_prov,
      coalesce(nullif(lok ->> 'jenis', ''), 'kios_tetap')::public.sighting_kind,
      nullif(trim(lok ->> 'mapsUrl'), ''),
      coalesce(nullif(lok ->> 'tanggal', '')::date, current_date),
      nullif(trim(lok ->> 'orderUrl'), ''),
      coalesce((lok ->> 'izinPublik')::boolean, false),
      'pending',
      uid
    );
  end if;

  -- Vote kelangkaan dari pengirim (opsional)
  if nullif(data ->> 'rarity', '') is not null then
    insert into public.rarity_votes (user_id, snack_id, nilai)
    values (uid, v_snack, (data ->> 'rarity')::public.rarity_level);
  end if;

  return v_slug;
end;
$$;

revoke execute on function kirim_jajanan(jsonb) from public, anon;
grant execute on function kirim_jajanan(jsonb) to authenticated;

-- -----------------------------------------------------------------
-- moderasi_jajanan: setujui / tolak satu kiriman beserta resep, foto,
-- dan lokasinya, lalu catat di moderation_logs.
-- security invoker: tetap tunduk RLS (hanya admin, bukan kiriman sendiri).
-- -----------------------------------------------------------------
create function moderasi_jajanan(p_snack uuid, p_aksi text, p_alasan text default null) returns void
language plpgsql security invoker set search_path = ''
as $$
declare
  v_status public.content_status;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin';
  end if;
  if p_aksi = 'approve' then
    v_status := 'approved';
  elsif p_aksi = 'reject' then
    if trim(coalesce(p_alasan, '')) = '' then
      raise exception 'Alasan penolakan wajib diisi';
    end if;
    v_status := 'rejected';
  else
    raise exception 'Aksi tidak dikenal';
  end if;

  update public.snacks
  set status = v_status,
      alasan_tolak = case when v_status = 'rejected' then trim(p_alasan) end,
      updated_at = now()
  where id = p_snack and status = 'pending';
  if not found then
    raise exception 'Kiriman tidak ditemukan, sudah dimoderasi, atau milik sendiri';
  end if;

  update public.recipes set status = v_status where snack_id = p_snack and status = 'pending';
  update public.sightings set status = v_status where snack_id = p_snack and status = 'pending';
  update public.snack_photos set status = v_status where snack_id = p_snack and status = 'pending';

  insert into public.moderation_logs (target_type, target_id, aksi, alasan, admin_id)
  values ('snack', p_snack, p_aksi, nullif(trim(p_alasan), ''), auth.uid());
end;
$$;

revoke execute on function moderasi_jajanan(uuid, text, text) from public, anon;
grant execute on function moderasi_jajanan(uuid, text, text) to authenticated;

-- -----------------------------------------------------------------
-- protect_role: izinkan ubah role dari SQL Editor / service (auth.uid() null),
-- supaya tim bisa menjadikan akun sebagai admin. Dari aplikasi tetap
-- hanya admin yang bisa mengubah role.
-- -----------------------------------------------------------------
create or replace function protect_role() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'Tidak boleh mengubah role';
  end if;
  return new;
end;
$$;
