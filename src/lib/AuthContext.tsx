import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "./supabase";

// ผลลัพธ์: null = สำเร็จ · ข้อความ = error
type AuthResult = Promise<string | null>;

type AuthContextValue = {
  session: Session | null; // null = ยังไม่ login
  signIn: (email: string, password: string) => AuthResult;
  signUp: (email: string, password: string) => AuthResult;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // session ที่จำไว้ในเครื่อง (ถ้าเคย login)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // ฟังทุกครั้งที่ login / logout / ต่ออายุ token
    const { data } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return error.message;
    if (!data.session) return "สมัครแล้ว แต่ต้องยืนยันอีเมลก่อน (ดู ML4)";
    return null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ต้องอยู่ภายใน <AuthProvider>");
  return ctx;
}
