import { useState } from "react";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import MenuCard from "../../components/MenuCard";
import { useAuth } from "../../lib/AuthContext";
import { useMenus } from "../../lib/MenuContext";
import { COLORS, SPACING } from "../../lib/theme";

const CATEGORIES = ["ข้าว", "เส้น", "จานเดียว", "เครื่องดื่ม"];

export default function AddMenu() {
  const { session } = useAuth();
  const { addMenu } = useMenus();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // TextInput ให้ค่าเป็น string เสมอ
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [spicy, setSpicy] = useState(false);
  const [submitted, setSubmitted] = useState(false); // กดบันทึกแล้วหรือยัง
  const [message, setMessage] = useState("");

  // ตรวจความถูกต้อง: คำนวณใหม่ทุกครั้งที่ render — ไม่ต้องเก็บเป็น state
  const priceNum = Number(price);
  const nameError = name.trim() === "" ? "กรุณากรอกชื่อเมนู" : "";
  const priceError =
    price.trim() === "" || isNaN(priceNum) || priceNum <= 0
      ? "ราคาต้องเป็นตัวเลขมากกว่า 0"
      : "";
  const isValid = nameError === "" && priceError === "";

  const handleSave = async () => {
    setSubmitted(true);
    if (!isValid) return; // ยังไม่ผ่าน → แสดง error แล้วหยุด
    const error = await addMenu({
      name: name.trim(),
      price: priceNum,
      category,
      spicy,
      emoji: spicy ? "🌶️" : "🍽️",
    });
    if (error) {
      setMessage("❌ " + error); // เช่น RLS ไม่ยอม / ยังไม่ login
      return;
    }
    setMessage(`บันทึก "${name.trim()}" แล้ว`);
    setName("");
    setPrice("");
    setSpicy(false);
    setSubmitted(false);
    router.navigate("/"); // กลับไปหน้าแรก
  };

  // ยังไม่ login → ให้ไปหน้า login ก่อน (RLS ไม่ยอมให้ anon เพิ่มอยู่แล้ว)
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>ต้องเข้าสู่ระบบก่อนเพิ่มเมนู</Text>
        <Pressable style={styles.saveBtn} onPress={() => router.push("/login")}>
          <Text style={styles.saveText}>เข้าสู่ระบบ / สมัครสมาชิก</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>ชื่อเมนู *</Text>
        <TextInput
          style={[styles.input, submitted && nameError !== "" && styles.inputError]}
          placeholder="เช่น ข้าวผัดกุ้ง"
          value={name}
          onChangeText={setName}
        />
        {submitted && nameError !== "" && <Text style={styles.error}>{nameError}</Text>}

        <Text style={styles.label}>ราคา (บาท) *</Text>
        <TextInput
          style={[styles.input, submitted && priceError !== "" && styles.inputError]}
          placeholder="เช่น 55"
          keyboardType="numeric"
          maxLength={4}
          value={price}
          onChangeText={setPrice}
        />
        {submitted && priceError !== "" && <Text style={styles.error}>{priceError}</Text>}

        <Text style={styles.label}>หมวด</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const on = category === c; // ปุ่มนี้ถูกเลือกอยู่ไหม
            return (
              <Pressable
                key={c}
                style={[styles.chip, on && styles.chipOn]}
                onPress={() => setCategory(c)}
              >
                <Text style={on ? styles.chipTextOn : styles.chipText}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>เผ็ด 🌶️</Text>
          <Switch value={spicy} onValueChange={setSpicy} />
        </View>

        <Text style={styles.label}>ตัวอย่างการ์ด</Text>
        <MenuCard
          menu={{
            id: 0,
            name: name || "ชื่อเมนู",
            price: priceNum || 0,
            category,
            spicy,
            emoji: spicy ? "🌶️" : "🍽️",
          }}
        />

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>บันทึกเมนู</Text>
        </Pressable>
        {message !== "" && <Text style={styles.success}>✅ {message}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md, gap: SPACING.sm, backgroundColor: COLORS.bg },
  label: { fontSize: 15, fontWeight: "bold", color: COLORS.text, marginTop: SPACING.sm },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: { borderColor: COLORS.danger },
  error: { color: COLORS.danger, fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
  },
  chipOn: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.primary },
  chipTextOn: { color: "white", fontWeight: "bold" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  saveBtn: {
    marginTop: SPACING.md,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  saveText: { color: "white", fontWeight: "bold", fontSize: 16 },
  success: { color: "#15803D", textAlign: "center", marginTop: SPACING.sm },
});
