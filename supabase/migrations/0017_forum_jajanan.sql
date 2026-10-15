-- =================================================================
-- Jejak Jajan - Forum Jajanan (pengganti Tanya Jajanan)
-- Postingan bebas seputar jajanan tradisional, wajib pilih topik.
-- Postingan langsung tampil; dijaga lewat filter kata kasar, Laporkan, dan hapus admin.
-- Jalankan setelah 0016 di Supabase Dashboard > SQL Editor.
-- =================================================================

-- Topik postingan
alter table requests add column if not exists topik text not null default 'obrolan';
alter table requests drop constraint if exists requests_topik_check;
alter table requests add constraint requests_topik_check
  check (topik in ('cari-resep', 'cari-penjual', 'sejarah', 'tips', 'obrolan'));

-- Balasan terbaik pilihan pemilik postingan
alter table requests add column if not exists jawaban_terbaik uuid references request_answers (id) on delete set null;

-- Status "Terjawab" hanya untuk topik mencari (resep / penjual)
create or replace function tandai_terjawab() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.requests
  set status = 'answered',
      answered_snack_id = coalesce(answered_snack_id, new.snack_id)
  where id = new.request_id and topik in ('cari-resep', 'cari-penjual');
  return new;
end;
$$;

-- Pemilik postingan memilih / membatalkan balasan terbaik (null = batal)
create or replace function pilih_jawaban_terbaik(p_request uuid, p_answer uuid) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.requests where id = p_request and created_by = auth.uid()) then
    raise exception 'Hanya pemilik postingan yang bisa memilih balasan terbaik';
  end if;
  if p_answer is not null
     and not exists (select 1 from public.request_answers where id = p_answer and request_id = p_request) then
    raise exception 'Balasan tidak ditemukan';
  end if;
  update public.requests set jawaban_terbaik = p_answer, status = case when p_answer is null then status else 'answered' end
  where id = p_request;
end;
$$;
revoke execute on function pilih_jawaban_terbaik(uuid, uuid) from public, anon;
grant execute on function pilih_jawaban_terbaik(uuid, uuid) to authenticated;

-- Laporan boleh menunjuk postingan / balasan forum
alter table reports drop constraint if exists reports_target_type_check;
alter table reports add constraint reports_target_type_check
  check (target_type in ('snack', 'recipe', 'sighting', 'comment', 'photo', 'forum_post', 'forum_reply'));
