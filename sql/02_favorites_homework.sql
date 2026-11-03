-- คาบ 11 · การบ้าน: เมนูโปรด (ความสัมพันธ์ M:N ผู้ใช้ ↔ เมนู)
-- รันหลัง 01_owner_and_policies.sql

-- การบ้าน: เมนูโปรดของแต่ละคน (ตารางกลาง M:N)
create table public.favorites (
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  menu_id bigint not null references public.menus (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, menu_id)
);

alter table public.favorites enable row level security;
grant select, insert, delete on public.favorites to authenticated;

create policy "ดูเมนูโปรดตัวเอง" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "เพิ่มเมนูโปรดตัวเอง" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ลบเมนูโปรดตัวเอง" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);
