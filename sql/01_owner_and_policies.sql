-- คาบ 11 · ML3: เจ้าของเมนู + สิทธิ์เขียนเฉพาะของตัวเอง
-- รันใน SQL Editor ของโปรเจกต์ที่ทำคาบ 10 แล้ว (มีตาราง menus + view menu_list)
-- รันซ้ำจะเจอ "already exists" = เคยรันแล้ว ไม่ต้องรันอีก

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
