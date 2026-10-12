-- =================================================================
-- Jejak Jajan - view katalog + kategori tambahan
-- Jalankan setelah 0001 & 0002 di Supabase Dashboard > SQL Editor.
-- =================================================================

insert into categories (nama, slug) values ('Olahan ketan', 'olahan-ketan')
on conflict (nama) do nothing;

-- Perkiraan kelangkaan dari tim untuk data awal. Dipakai sampai ada min. 3 suara.
alter table snacks add column rarity_awal rarity_level;

-- Data ringkas untuk kartu katalog (payload kecil). security_invoker: RLS tetap berlaku.
create view snack_cards with (security_invoker = true) as
select
  s.id,
  s.slug,
  s.nama,
  s.nama_lain,
  s.deskripsi_singkat,
  s.cover_url,
  s.created_at,
  p.nama as provinsi,
  p.slug as provinsi_slug,
  c.nama as kategori,
  coalesce(r.label, s.rarity_awal)::text as rarity,
  coalesce(r.jumlah_vote, 0)::int as jumlah_vote,
  case coalesce(r.label, s.rarity_awal)
    when 'punah' then 4 when 'hampir_punah' then 3 when 'mulai_langka' then 2 when 'umum' then 1 else 0
  end as rarity_rank,
  exists (select 1 from recipes x where x.snack_id = s.id and x.status = 'approved') as punya_resep,
  exists (select 1 from recipes x where x.snack_id = s.id and x.status = 'approved' and x.video_url is not null) as punya_video,
  exists (select 1 from sightings x where x.snack_id = s.id and x.status = 'approved') as punya_lokasi,
  lower(s.nama || ' ' || array_to_string(s.nama_lain, ' ')) as cari
from snacks s
left join provinces p on p.id = s.province_id
left join categories c on c.id = s.category_id
left join snack_rarity r on r.snack_id = s.id
where s.status = 'approved';
