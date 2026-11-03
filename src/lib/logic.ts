// ย้ายมาจากคาบ 8 — เพิ่มข้อมูลหมวด / เผ็ด / emoji ให้เมนู
export type Menu = {
  id: number;
  name: string;
  price: number;
  category: string;
  spicy: boolean;
  emoji: string;
  created_by?: string | null; // คาบ 11: id ผู้เพิ่ม (null = เมนูของร้าน)
};

export const filterByBudget = (menus: Menu[], budget: number): Menu[] => {
  if (budget < 0) return [];
  return menus.filter((m) => m.price <= budget);
};

export const sortByPrice = (menus: Menu[]): Menu[] =>
  [...menus].sort((a, b) => a.price - b.price);

// ML7: ค้นหาจากชื่อ (ไม่สนตัวพิมพ์เล็ก-ใหญ่) — คำค้นว่าง = ไม่กรอง
export const searchByName = (menus: Menu[], keyword: string): Menu[] => {
  const k = keyword.trim().toLowerCase();
  if (k === "") return menus;
  return menus.filter((m) => m.name.toLowerCase().includes(k));
};
