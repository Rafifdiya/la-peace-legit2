-- =================================================================
-- Jejak Jajan - Premium (MODE DEMO, tanpa pembayaran) + Koleksi
-- Freemium (docs/05 Tema A poin 6): isi arsip tetap gratis; premium =
-- bebas iklan + koleksi tanpa batas (gratis maks. 3 koleksi).
-- Jalankan setelah 0009 di Supabase Dashboard > SQL Editor.
-- =================================================================

-- -----------------------------------------------------------------
-- Status premium: aktif selama premium_sampai > sekarang.
-- -----------------------------------------------------------------
alter table profiles add column premium_sampai timestamptz;

create function is_premium(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select premium_sampai > now() from public.profiles where id = uid), false);
$$;

-- Kolom premium hanya boleh diubah lewat fungsi demo di bawah atau oleh admin,
-- bukan lewat update profil biasa.
create function protect_premium() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.premium_sampai is distinct from old.premium_sampai
     and (select auth.uid()) is not null
     and coalesce(current_setting('jj.premium_demo', true), '') <> '1'
     and not public.is_admin() then
    raise exception 'Tidak boleh mengubah status premium';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_premium before update on profiles
  for each row execute function protect_premium();

-- MODE DEMO: aktifkan premium 30 hari tanpa bayar. Ganti dengan webhook
-- payment gateway (Midtrans/Xendit) bila nanti pakai pembayaran asli.
create function aktifkan_premium_demo() returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare
  v_sampai timestamptz := now() + interval '30 days';
begin
  if auth.uid() is null then
    raise exception 'Harus masuk dulu';
  end if;
  perform set_config('jj.premium_demo', '1', true);
  update public.profiles set premium_sampai = v_sampai where id = auth.uid();
  return v_sampai;
end;
$$;

create function batalkan_premium_demo() returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Harus masuk dulu';
  end if;
  perform set_config('jj.premium_demo', '1', true);
  update public.profiles set premium_sampai = null where id = auth.uid();
end;
$$;

revoke execute on function aktifkan_premium_demo() from public, anon;
revoke execute on function batalkan_premium_demo() from public, anon;
grant execute on function aktifkan_premium_demo() to authenticated;
grant execute on function batalkan_premium_demo() to authenticated;

-- -----------------------------------------------------------------
-- Koleksi: kelompok jajanan tersimpan milik user (mis. "Kue Lebaran").
-- -----------------------------------------------------------------
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade default auth.uid(),
  nama text not null check (length(trim(nama)) between 1 and 40),
  created_at timestamptz not null default now()
);

create table collection_items (
  collection_id uuid not null references collections (id) on delete cascade,
  snack_id uuid not null references snacks (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, snack_id)
);

alter table collections enable row level security;
alter table collection_items enable row level security;

create policy "kelola koleksi sendiri" on collections for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "kelola isi koleksi sendiri" on collection_items for all to authenticated
  using (exists (select 1 from collections c where c.id = collection_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from collections c where c.id = collection_id and c.user_id = (select auth.uid())));

-- Akun gratis maksimal 3 koleksi; premium tanpa batas.
create function batas_koleksi() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if not public.is_premium(new.user_id)
     and (select count(*) from public.collections where user_id = new.user_id) >= 3 then
    raise exception 'Akun gratis maksimal 3 koleksi. Upgrade ke Premium untuk koleksi tanpa batas.';
  end if;
  return new;
end;
$$;

create trigger collections_batas before insert on collections
  for each row execute function batas_koleksi();
