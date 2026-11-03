import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

// ค่ามาจากไฟล์ .env.local (ชื่อขึ้นต้น EXPO_PUBLIC_ = แอปอ่านได้)
const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// ตอน build เว็บ (static render บน Node) ไม่มี window → ยังไม่ต้องจำ session
const canStore = Platform.OS !== "web" || typeof window !== "undefined";

export const supabase = createClient(url, key, {
  auth: {
    storage: canStore ? AsyncStorage : undefined, // จำ session ไว้ในเครื่อง
    persistSession: canStore,
    autoRefreshToken: canStore,
    detectSessionInUrl: false,
  },
});

// มือถือ: ต่ออายุ token อัตโนมัติเฉพาะตอนแอปเปิดอยู่
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
