import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Menu } from "./logic";
import { supabase } from "./supabase";

type Category = { id: number; name: string };

// ฟังก์ชันเขียนข้อมูลคืนค่า null = สำเร็จ · ข้อความ = error
type WriteResult = Promise<string | null>;

type MenuContextValue = {
  menus: Menu[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  addMenu: (menu: Omit<Menu, "id">) => WriteResult;
  updatePrice: (id: number, price: number) => WriteResult;
  deleteMenu: (id: number) => WriteResult;
};

const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  // R: อ่านเมนู + หมวด (ตอนเปิดแอป และทุกครั้งที่ reload)
  useEffect(() => {
    async function load() {
      const [menuRes, catRes] = await Promise.all([
        supabase.from("menu_list").select("*").order("price"),
        supabase.from("categories").select("id, name"),
      ]);
      const err = menuRes.error ?? catRes.error;
      if (err) {
        setError(err.message);
      } else {
        setMenus(menuRes.data as Menu[]);
        setCategories(catRes.data as Category[]);
        setError(null);
      }
      setLoading(false);
    }
    load();
  }, [reloadCount]);

  const reload = () => {
    setLoading(true);
    setReloadCount((n) => n + 1);
  };

  // C: เพิ่มเมนู — created_by ใส่ให้เองจาก default auth.uid()
  const addMenu = async (menu: Omit<Menu, "id">) => {
    const category = categories.find((c) => c.name === menu.category);
    if (!category) return "ไม่พบหมวด " + menu.category;
    const { error } = await supabase.from("menus").insert({
      name: menu.name,
      price: menu.price,
      spicy: menu.spicy,
      emoji: menu.emoji,
      category_id: category.id,
    });
    if (error) return error.message;
    reload();
    return null;
  };

  // U: แก้ราคา — RLS ยอมเฉพาะเมนูของตัวเอง (ไม่ใช่ = ได้ 0 แถว)
  const updatePrice = async (id: number, price: number) => {
    const { data, error } = await supabase
      .from("menus")
      .update({ price })
      .eq("id", id)
      .select();
    if (error) return error.message;
    if (data.length === 0) return "แก้ไม่ได้ — ไม่ใช่เมนูของคุณ";
    reload();
    return null;
  };

  // D: ลบเมนู — เงื่อนไขเดียวกับแก้
  const deleteMenu = async (id: number) => {
    const { data, error } = await supabase
      .from("menus")
      .delete()
      .eq("id", id)
      .select();
    if (error) return error.message;
    if (data.length === 0) return "ลบไม่ได้ — ไม่ใช่เมนูของคุณ";
    reload();
    return null;
  };

  const value = {
    menus,
    loading,
    error,
    reload,
    addMenu,
    updatePrice,
    deleteMenu,
  };
  return (
    <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
  );
}

// หน้าจอไหนอยากใช้ข้อมูลเมนู เรียก useMenus()
export function useMenus() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenus ต้องอยู่ภายใน <MenuProvider>");
  return ctx;
}
