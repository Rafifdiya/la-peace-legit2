-- =================================================================
-- Jejak Jajan - Pengirim boleh menghapus kontribusinya sendiri
-- Apa pun statusnya. Resep, foto, lokasi, vote, komentar, "sudah coba",
-- dan simpanan ikut terhapus (on delete cascade).
-- Jalankan setelah 0020 di Supabase Dashboard > SQL Editor.
-- =================================================================

drop policy if exists "hapus jajanan sendiri" on snacks;
create policy "hapus jajanan sendiri" on snacks for delete to authenticated
  using (created_by = (select auth.uid()));
