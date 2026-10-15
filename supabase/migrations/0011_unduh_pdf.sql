-- =================================================================
-- Jejak Jajan - Batas unduh resep PDF
-- Akun gratis maks. 5x per 7 hari terakhir; Premium sepuasnya.
-- Jalankan setelah 0010 di Supabase Dashboard > SQL Editor.
-- =================================================================

create table unduhan_pdf (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references profiles (id) on delete cascade,
  snack_id uuid not null references snacks (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index unduhan_pdf_user_waktu on unduhan_pdf (user_id, created_at);

alter table unduhan_pdf enable row level security;

-- Hanya boleh lihat riwayat sendiri; insert lewat fungsi di bawah saja.
create policy "lihat unduhan sendiri" on unduhan_pdf
  for select to authenticated using (user_id = (select auth.uid()));

-- Catat 1 unduhan. Hasil: sisa kuota minggu ini (-1 = Premium, tanpa batas).
create function catat_unduh_pdf(p_snack uuid) returns int
language plpgsql security definer set search_path = ''
as $$
declare
  v_jumlah int;
begin
  if auth.uid() is null then
    raise exception 'Harus masuk dulu';
  end if;
  if public.is_premium() then
    insert into public.unduhan_pdf (user_id, snack_id) values (auth.uid(), p_snack);
    return -1;
  end if;
  select count(*) into v_jumlah from public.unduhan_pdf
    where user_id = auth.uid() and created_at > now() - interval '7 days';
  if v_jumlah >= 5 then
    raise exception 'Batas unduh PDF akun gratis 5x per minggu sudah habis. Premium bisa unduh sepuasnya.';
  end if;
  insert into public.unduhan_pdf (user_id, snack_id) values (auth.uid(), p_snack);
  return 4 - v_jumlah;
end;
$$;

revoke execute on function catat_unduh_pdf(uuid) from public, anon;
grant execute on function catat_unduh_pdf(uuid) to authenticated;
