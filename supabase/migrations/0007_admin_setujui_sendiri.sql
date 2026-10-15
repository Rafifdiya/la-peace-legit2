-- =================================================================
-- Jejak Jajan - admin boleh memoderasi kiriman sendiri
-- Keputusan tim (2026-10-14): kiriman admin tetap masuk antrean
-- "Menunggu" dan harus disetujui admin, boleh admin itu sendiri.
-- Jalankan setelah 0006 di Supabase Dashboard > SQL Editor.
-- =================================================================

drop policy "admin moderasi jajanan" on snacks;
create policy "admin moderasi jajanan" on snacks for update using (is_admin());

drop policy "admin moderasi foto" on snack_photos;
create policy "admin moderasi foto" on snack_photos for update using (is_admin());

drop policy "admin moderasi resep" on recipes;
create policy "admin moderasi resep" on recipes for update using (is_admin());

drop policy "admin moderasi lokasi" on sightings;
create policy "admin moderasi lokasi" on sightings for update using (is_admin());

-- Pesan error disesuaikan (tidak lagi menyebut "milik sendiri")
create or replace function moderasi_jajanan(p_snack uuid, p_aksi text, p_alasan text default null) returns void
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
    raise exception 'Kiriman tidak ditemukan atau sudah dimoderasi';
  end if;

  update public.recipes set status = v_status where snack_id = p_snack and status = 'pending';
  update public.sightings set status = v_status where snack_id = p_snack and status = 'pending';
  update public.snack_photos set status = v_status where snack_id = p_snack and status = 'pending';

  insert into public.moderation_logs (target_type, target_id, aksi, alasan, admin_id)
  values ('snack', p_snack, p_aksi, nullif(trim(p_alasan), ''), auth.uid());
end;
$$;
