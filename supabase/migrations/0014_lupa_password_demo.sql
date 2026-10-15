-- =================================================================
-- Jejak Jajan - Lupa password MODE DEMO (tanpa email)
-- Ganti password langsung cukup dengan email terdaftar.
-- Bukan untuk produksi: siapa pun yang tahu email bisa
-- mengganti password. Akun admin dikecualikan.
-- Ganti dengan reset lewat email (SMTP) sebelum rilis sungguhan.
-- =================================================================

drop function if exists reset_password_demo(text, text, text);

create or replace function reset_password_demo(p_email text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, auth
as $$
declare
  v_id uuid;
begin
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password minimal 6 karakter';
  end if;

  select u.id into v_id
  from auth.users u
  join public.profiles p on p.id = u.id
  where lower(u.email) = lower(trim(p_email))
    and p.role <> 'admin';

  if v_id is null then
    return false;
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
      updated_at = now()
  where id = v_id;
  return true;
end;
$$;

revoke all on function reset_password_demo(text, text) from public;
grant execute on function reset_password_demo(text, text) to anon, authenticated;
