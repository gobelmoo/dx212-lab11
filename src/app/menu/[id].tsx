import { useState } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../../lib/AuthContext";
import { useMenus } from "../../lib/MenuContext";
import { COLORS, SPACING } from "../../lib/theme";

export default function MenuDetail() {
  const { session } = useAuth();
  const { menus, loading, updatePrice, deleteMenu } = useMenus();
  const { id } = useLocalSearchParams<{ id: string }>();
  const menu = menus.find((m) => m.id === Number(id));
  const [newPrice, setNewPrice] = useState("");
  const [confirming, setConfirming] = useState(false); // กดลบครั้งแรกแล้ว
  const [message, setMessage] = useState("");

  if (loading && !menu) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!menu) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "ไม่พบเมนู" }} />
        <Text style={styles.name}>ไม่พบเมนูนี้ (id: {id})</Text>
      </View>
    );
  }

  // เจ้าของ = คนที่ login อยู่ และเป็นคนเพิ่มเมนูนี้
  const isOwner = session !== null && menu.created_by === session.user.id;

  const handleUpdate = async () => {
    const price = Number(newPrice);
    if (newPrice.trim() === "" || isNaN(price) || price <= 0) {
      setMessage("ราคาต้องเป็นตัวเลขมากกว่า 0");
      return;
    }
    const error = await updatePrice(menu.id, price);
    setMessage(error ? "❌ " + error : "✅ บันทึกราคาแล้ว");
    if (!error) setNewPrice("");
  };

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true); // กดครั้งแรก = ขอให้กดยืนยันอีกครั้ง
      return;
    }
    const error = await deleteMenu(menu.id);
    if (error) {
      setMessage("❌ " + error);
      setConfirming(false);
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: menu.name }} />
      <Text style={styles.emoji}>{menu.emoji}</Text>
      <Text style={styles.name}>{menu.name}</Text>
      <Text style={styles.price}>{menu.price} บาท</Text>

      <View style={styles.tags}>
        <Text style={styles.tag}>{menu.category}</Text>
        {menu.spicy && <Text style={styles.tag}>เผ็ด 🌶️</Text>}
      </View>

      {isOwner ? (
        <View style={styles.ownerBox}>
          <Text style={styles.ownerTitle}>เมนูของคุณ</Text>
          <TextInput
            style={styles.input}
            placeholder={`ราคาใหม่ (ตอนนี้ ${menu.price})`}
            keyboardType="numeric"
            value={newPrice}
            onChangeText={setNewPrice}
          />
          <Pressable style={styles.btn} onPress={handleUpdate}>
            <Text style={styles.btnText}>บันทึกราคา</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.danger]} onPress={handleDelete}>
            <Text style={styles.btnText}>
              {confirming ? "กดอีกครั้งเพื่อยืนยันการลบ" : "ลบเมนูนี้"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.note}>
          {menu.created_by
            ? "เมนูนี้เพิ่มโดยผู้ใช้อื่น — แก้/ลบไม่ได้"
            : "เมนูของร้าน — แก้/ลบไม่ได้"}
        </Text>
      )}
      {message !== "" && <Text style={styles.note}>{message}</Text>}

      <Pressable style={styles.btn} onPress={() => router.back()}>
        <Text style={styles.btnText}>← กลับ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.lg,
    gap: SPACING.sm,
    backgroundColor: COLORS.bg,
  },
  emoji: { fontSize: 72 },
  name: { fontSize: 24, fontWeight: "bold", color: COLORS.text },
  price: { fontSize: 20, color: COLORS.primary, fontWeight: "bold" },
  tags: { flexDirection: "row", gap: SPACING.sm },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.muted,
  },
  btn: {
    marginTop: SPACING.lg,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  ownerBox: {
    alignSelf: "stretch",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.card,
  },
  ownerTitle: { fontWeight: "bold", color: COLORS.primary },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  danger: { backgroundColor: COLORS.danger },
  note: { color: COLORS.muted, textAlign: "center" },
});
