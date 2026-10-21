-- =================================================================
-- Jejak Jajan - Kontribusi: provinsi asal tidak wajib
-- Syarat kirim di form: nama + foto utama, cerita min. 10 karakter, vote kelangkaan.
-- Jalankan setelah 0022 di Supabase Dashboard > SQL Editor.
-- =================================================================

create or replace function kirim_jajanan(data jsonb) returns text
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

  -- Provinsi kini opsional (boleh kosong)
  v_prov := (select id from public.provinces where slug = nullif(data ->> 'provinsi', ''));

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
      coalesce(nullif(trim(lok ->> 'area'), ''), (select nama from public.provinces where id = v_prov), '-'),
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
