# dx212-lab11 — แอป "กินในงบ" + Supabase Auth + CRUD (จบคาบ 11)

โค้ดเฉลยฉบับสมบูรณ์ของ dX212 Mobile Programming คาบ 11 (API & Data Integration) ใช้เป็นจุดเริ่มของ **คาบ 12: Deployment & DevOps Basics**

- Expo SDK 57 · Expo Router · TypeScript · `@supabase/supabase-js` v2
- สมัครสมาชิก / เข้าสู่ระบบ / ออกจากระบบ ด้วยอีเมล + รหัสผ่าน (Supabase Auth) — ปิดแอปแล้วยัง login อยู่
- เพิ่มเมนูลงฐานข้อมูลจริง (insert) · แก้ราคา (update) · ลบ (delete) ได้ **เฉพาะเมนูของตัวเอง**
- สิทธิ์ตัดสินที่ฐานข้อมูลด้วย RLS (`created_by = auth.uid()`) — ไม่ใช่แค่ซ่อนปุ่มในแอป

## 1) ตั้งฐานข้อมูล (ครั้งเดียว)

Supabase → **SQL Editor**

- เคยทำคาบ 10 แล้ว → รัน `sql/01_owner_and_policies.sql`
- โปรเจกต์ใหม่ → รัน `sql/setup_all.sql` (คาบ 10 + 11 ในไฟล์เดียว)

แล้วเช็คด้วย `sql/03_check.sql` (ลากเลือกทีละ query แล้ว Run)

## 2) ตั้งค่า Authentication (ครั้งเดียว)

Supabase → **Authentication → Sign In / Providers → Email**

- Enable Email provider = เปิด
- **Confirm email = ปิด** (ช่วงพัฒนา) → Save
  ไม่งั้นสมัครแล้วต้องกดลิงก์ยืนยันในอีเมลก่อน และอีเมลระบบของ Supabase ส่งได้แค่ 2 ฉบับ/ชั่วโมง
- ทดลองหลายบัญชีด้วยอีเมลเดียว: `you+a@gmail.com`, `you+b@gmail.com`
- ดูผู้ใช้ทั้งหมด: **Authentication → Users**

> แอปที่ใช้งานจริงต้องเปิด Confirm email กลับ และตั้ง SMTP ของตัวเอง

## 3) ติดตั้งและรันแอป

```bash
git clone https://github.com/gobelmoo/dx212-lab11.git dx212-lab12
cd dx212-lab12
rm -rf .git && git init          # Windows PowerShell: Remove-Item -Recurse -Force .git
npm install
cp .env.example .env.local      # Windows: copy .env.example .env.local
```

เปิด `.env.local` ใส่ค่าจริงจาก Supabase → ปุ่ม **Connect** (หรือ Project Settings → API Keys):

```
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

```bash
npx expo start        # กด w = เว็บ · a = Android Emulator · สแกน QR = Expo Go
```

> ใส่ได้เฉพาะ **publishable key** — ห้ามใช้ secret key (`sb_secret_...`) ในแอปเด็ดขาด
> `.env.local` ถูก `.gitignore` กันไว้ ไม่ขึ้น GitHub · แก้ไฟล์นี้แล้วต้องหยุด `expo start` (Ctrl+C) แล้วรันใหม่

## 4) ทดสอบสิทธิ์ด้วย 2 บัญชี

1. แท็บ **เกี่ยวกับ** → สมัครบัญชี A → แท็บ **เพิ่มเมนู** → เพิ่มเมนูใหม่
2. เปิดเมนูนั้น → เห็นกล่อง "เมนูของคุณ" (แก้ราคา / ลบ)
3. ออกจากระบบ → สมัครบัญชี B → เปิดเมนูของ A → "เมนูนี้เพิ่มโดยผู้ใช้อื่น — แก้/ลบไม่ได้"
4. เมนูเดิม 5 รายการ (`created_by` ว่าง) = เมนูของร้าน — ไม่มีใครแก้/ลบได้

## โครงไฟล์ (ส่วนที่เปลี่ยนจาก lab10)

```
src/lib/
├── supabase.ts       ← จำ session ด้วย AsyncStorage + ต่ออายุ token อัตโนมัติ
├── AuthContext.tsx   ← ใหม่: session + signIn / signUp / signOut + useAuth()
├── MenuContext.tsx   ← addMenu (insert) · updatePrice (update) · deleteMenu (delete)
└── logic.ts          ← type Menu เพิ่ม created_by
src/app/_layout.tsx        ← ครอบ AuthProvider + ลงทะเบียนหน้า login (modal)
src/app/login.tsx          ← ใหม่: ฟอร์มเข้าสู่ระบบ / สมัครสมาชิก
src/app/(tabs)/about.tsx   ← แสดงอีเมลที่ login + ปุ่มออกจากระบบ
src/app/(tabs)/add.tsx     ← ต้อง login ก่อน · บันทึกลงฐานข้อมูล
src/app/menu/[id].tsx      ← เจ้าของเมนู: แก้ราคา / ลบ (กด 2 ครั้ง)
sql/                       ← SQL คาบ 11 (setup_all.sql = คาบ 10 + 11)
```

## ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|---|---|
| `npm install` เตือน deprecated / vulnerabilities | ปกติ — **ห้ามรัน `npm audit fix --force`** (เวอร์ชันจะไม่ตรง Expo SDK 57) |
| จอแดง `supabaseUrl is required.` | ไม่มี `.env.local` / ชื่อตัวแปรผิด / ยังไม่ restart `npx expo start` |
| สมัครแล้วขึ้น "ต้องยืนยันอีเมลก่อน" | ยังไม่ปิด Confirm email → ปิด แล้วลบ user นั้นใน Authentication → Users แล้วสมัครใหม่ |
| `Invalid login credentials` | อีเมล/รหัสผิด หรือยังไม่ได้สมัคร |
| `User already registered` | อีเมลนี้สมัครแล้ว → กด เข้าสู่ระบบ แทน |
| เพิ่มเมนูแล้วขึ้น `permission denied for table menus` | ยังไม่รัน `sql/01_owner_and_policies.sql` (GRANT) หรือยังไม่ login |
| `new row violates row-level security policy` | ยังไม่มี policy insert → รัน `sql/01_owner_and_policies.sql` |
| เป็นคนเพิ่มแต่ไม่เห็นกล่อง "เมนูของคุณ" | view `menu_list` ยังไม่มี `created_by` → รัน `sql/01_owner_and_policies.sql` แล้วกด ↻ โหลดใหม่ |
| `429 Too Many Requests` ตอนสมัคร | สมัครถี่เกิน รอ 5 นาที |
| ปิดแอปแล้ว login หลุด | ยังไม่ได้ `npm install` ให้ครบ (ต้องมี `@react-native-async-storage/async-storage`) |
