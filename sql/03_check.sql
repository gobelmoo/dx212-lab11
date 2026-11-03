-- คาบ 11 · เช็คงาน: ลากเลือกทีละ query แล้วกด Run (SQL Editor แสดงผลแค่ query สุดท้าย)

-- 1) เมนูแต่ละรายการเป็นของใคร (owner ว่าง = เมนูของร้าน)
select m.id, m.name, m.price, u.email as owner
from public.menus m
left join auth.users u on u.id = m.created_by
order by m.id;

-- 2) policy ของตาราง menus ต้องมี 4 ตัว: SELECT · INSERT · UPDATE · DELETE
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'menus'
order by cmd;

-- 3) GRANT: anon = SELECT อย่างเดียว · authenticated = DELETE, INSERT, SELECT, UPDATE
select grantee,
       string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'menus'
  and grantee in ('anon', 'authenticated')
group by grantee;
