-- โปรเจกต์ใหม่ / ตามไม่ทัน: รันไฟล์นี้ครั้งเดียว = ฐานข้อมูลเท่ากับจบคาบ 11
-- (คาบ 10: ตาราง + ข้อมูล + view + สิทธิ์อ่าน → คาบ 11: เจ้าของเมนู + สิทธิ์เขียนของตัวเอง)
-- ถ้าเคยรันคาบ 10 แล้ว ให้รันแค่ 01_owner_and_policies.sql

-- ===================== คาบ 10 =====================
-- ML3: สร้าง 2 ตาราง (หมวด 1 → เมนูหลายรายการ)
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table public.menus (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null check (price > 0),
  spicy boolean not null default false,
  emoji text not null default '🍽️',
  category_id bigint not null references public.categories (id),
  created_at timestamptz not null default now()
);

-- ML4-A: ใส่หมวดก่อน (เพราะเมนูต้องอ้างถึงหมวด)
insert into public.categories (name)
values ('ข้าว'), ('เส้น'), ('จานเดียว'), ('เครื่องดื่ม');

select * from public.categories;

-- ML4-B: ใส่เมนู — category_id ต้องตรงกับ id ในตาราง categories
insert into public.menus (name, price, spicy, emoji, category_id)
values
  ('ข้าวมันไก่', 45, false, '🍗', 1),
  ('ก๋วยเตี๋ยวต้มยำ', 50, true, '🍜', 2),
  ('กะเพราหมูกรอบ', 60, true, '🌶️', 1),
  ('สเต๊กหมู', 89, false, '🥩', 3),
  ('ชาไทย', 25, false, '🧋', 4);

select * from public.menus;

-- ML6: view = SELECT ที่ตั้งชื่อไว้ แอปเรียกใช้เหมือนตาราง
create view public.menu_list
with (security_invoker = true) as
select m.id, m.name, m.price, c.name as category, m.spicy, m.emoji
from public.menus m
join public.categories c on c.id = m.category_id;

select * from public.menu_list order by price;

-- ML7-B: เปิด RLS (ตรวจสิทธิ์ทีละแถว) — ทำก่อน GRANT เสมอ
alter table public.categories enable row level security;
alter table public.menus enable row level security;

-- ML7-C: GRANT = อนุญาตให้ role แตะตาราง/view ผ่าน API
grant select on public.categories, public.menus, public.menu_list
  to anon, authenticated;

-- ML7-D: POLICY = กฎว่าแถวไหนอ่านได้ (true = ทุกแถว)
create policy "ทุกคนอ่านหมวดได้" on public.categories
  for select to anon, authenticated using (true);

create policy "ทุกคนอ่านเมนูได้" on public.menus
  for select to anon, authenticated using (true);

-- ===================== คาบ 11 =====================
-- ML3-A: เก็บว่าใครเป็นคนเพิ่มเมนู (ค่าเริ่มต้น = ผู้ที่ login อยู่)
alter table public.menus
  add column created_by uuid
    references auth.users (id) on delete cascade
    default auth.uid();

-- ML3-B: view ส่ง created_by ให้แอปด้วย (เพิ่มคอลัมน์ท้ายสุด)
create or replace view public.menu_list
with (security_invoker = true) as
select m.id, m.name, m.price, c.name as category, m.spicy, m.emoji,
       m.created_by
from public.menus m
join public.categories c on c.id = m.category_id;

-- ML3-C: ผู้ที่ login แล้ว (role authenticated) เขียนตาราง menus ได้
grant insert, update, delete on public.menus to authenticated;

-- ML3-D: แต่ RLS ยอมเฉพาะแถวที่ตัวเองเป็นเจ้าของ
create policy "เพิ่มเมนูในชื่อตัวเอง" on public.menus
  for insert to authenticated
  with check ((select auth.uid()) = created_by);

create policy "แก้ได้เฉพาะเมนูตัวเอง" on public.menus
  for update to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);

create policy "ลบได้เฉพาะเมนูตัวเอง" on public.menus
  for delete to authenticated
  using ((select auth.uid()) = created_by);
