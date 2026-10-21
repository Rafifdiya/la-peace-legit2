-- =================================================================
-- Jejak Jajan - Tanya Jajanan: status "Terjawab" otomatis
-- Policy insert requests / request_answers sudah ada di 0001.
-- Jalankan setelah 0015 di Supabase Dashboard > SQL Editor.
-- =================================================================

-- Jawaban pertama membuat pertanyaan berstatus 'answered' (tab Terjawab).
-- security definer: penjawab bukan pemilik pertanyaan, jadi tidak lolos RLS update.
create or replace function tandai_terjawab() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.requests
  set status = 'answered',
      answered_snack_id = coalesce(answered_snack_id, new.snack_id)
  where id = new.request_id;
  return new;
end;
$$;

drop trigger if exists request_answers_terjawab on request_answers;
create trigger request_answers_terjawab after insert on request_answers
  for each row execute function tandai_terjawab();

-- Isi jawaban dibatasi agar tidak spam
alter table request_answers drop constraint if exists request_answers_isi_panjang;
alter table request_answers add constraint request_answers_isi_panjang
  check (char_length(isi) between 3 and 1000);

-- Pemilik boleh menghapus pertanyaan / jawabannya sendiri; admin boleh semua
drop policy if exists "hapus request sendiri" on requests;
create policy "hapus request sendiri" on requests for delete to authenticated
  using (created_by = (select auth.uid()) or is_admin());
drop policy if exists "hapus jawaban sendiri" on request_answers;
create policy "hapus jawaban sendiri" on request_answers for delete to authenticated
  using (user_id = (select auth.uid()) or is_admin());
