import { useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../lib/AuthContext";
import { COLORS, SPACING } from "../lib/theme";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); // กำลังรอเซิร์ฟเวอร์
  const [message, setMessage] = useState("");

  const isValid = email.includes("@") && password.length >= 6;

  const submit = async (mode: "signIn" | "signUp") => {
    if (!isValid) {
      setMessage("กรอกอีเมล และรหัสผ่านอย่างน้อย 6 ตัว");
      return;
    }
    setBusy(true);
    const error =
      mode === "signIn"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    // สำเร็จ → ปิดหน้านี้ กลับไปหน้าที่มา
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>อีเมล</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.label}>รหัสผ่าน (อย่างน้อย 6 ตัว)</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {message !== "" && (
        <Text style={styles.error}>{message}</Text>
      )}

      <Pressable
        style={[styles.btn, busy && styles.busy]}
        disabled={busy}
        onPress={() => submit("signIn")}
      >
        <Text style={styles.btnText}>
          {busy ? "กำลังส่ง…" : "เข้าสู่ระบบ"}
        </Text>
      </Pressable>
      <Pressable
        style={styles.outline}
        disabled={busy}
        onPress={() => submit("signUp")}
      >
        <Text style={styles.outlineText}>สมัครสมาชิกใหม่</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: COLORS.bg,
  },
  label: { fontSize: 15, fontWeight: "bold", color: COLORS.text },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  error: { color: COLORS.danger },
  btn: {
    marginTop: SPACING.md,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  busy: { opacity: 0.5 },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  outline: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16 },
});
