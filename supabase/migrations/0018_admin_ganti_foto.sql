-- =================================================================
-- Jejak Jajan - Admin mengganti foto utama jajanan
-- Policy "admin moderasi jajanan" tidak berlaku untuk kiriman admin sendiri,
-- jadi penggantian foto lewat fungsi ini (cek admin di dalamnya).
-- Jalankan setelah 0017 di Supabase Dashboard > SQL Editor.
-- =================================================================

create or replace function admin_ganti_foto(p_slug text, p_url text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Khusus admin';
  end if;
  if p_url is null or p_url !~ '^https://' then
    raise exception 'URL foto tidak valid';
  end if;
  update public.snacks set cover_url = p_url, updated_at = now() where slug = p_slug;
  if not found then
    raise exception 'Jajanan tidak ditemukan';
  end if;
end;
$$;

revoke execute on function admin_ganti_foto(text, text) from public, anon;
grant execute on function admin_ganti_foto(text, text) to authenticated;
