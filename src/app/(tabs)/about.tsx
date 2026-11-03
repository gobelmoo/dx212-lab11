import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../../lib/AuthContext";
import { COLORS, SPACING } from "../../lib/theme";

export default function About() {
  const { session, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>กินในงบ 🍜</Text>
      <Text style={styles.text}>แอปช่วยเลือกเมนูไม่ให้เกินงบ</Text>
      <Text style={styles.text}>ผู้พัฒนา: ชื่อ นามสกุล (รหัสนักศึกษา)</Text>
      <Text style={styles.muted}>dX212 Mobile Programming · คาบ 11</Text>

      <View style={styles.account}>
        {session ? (
          <>
            <Text style={styles.text}>เข้าสู่ระบบเป็น {session.user.email}</Text>
            <Pressable style={styles.btn} onPress={signOut}>
              <Text style={styles.btnText}>ออกจากระบบ</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.btn} onPress={() => router.push("/login")}>
            <Text style={styles.btnText}>เข้าสู่ระบบ / สมัครสมาชิก</Text>
          </Pressable>
        )}
      </View>
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
  title: { fontSize: 28, fontWeight: "bold", color: COLORS.primary },
  text: { fontSize: 16, color: COLORS.text },
  muted: { fontSize: 14, color: COLORS.muted },
  account: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  btn: {
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
