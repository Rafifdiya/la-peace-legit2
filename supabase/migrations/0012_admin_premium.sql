-- =================================================================
-- Jejak Jajan - Admin otomatis Premium (untuk uji fitur Premium)
-- Jalankan setelah 0011 di Supabase Dashboard > SQL Editor.
-- =================================================================

create or replace function is_premium(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select role = 'admin' or premium_sampai > now() from public.profiles where id = uid),
    false
  );
$$;
