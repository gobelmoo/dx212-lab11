import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Menu } from "../lib/logic";
import { COLORS, SPACING } from "../lib/theme";

type MenuCardProps = {
  menu: Menu;
  onPress?: () => void; // ML5 ใช้ตอนกดการ์ดไปหน้ารายละเอียด
};

export default function MenuCard({ menu, onPress }: MenuCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.emojiBox}>
        <Text style={styles.emoji}>{menu.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{menu.name}</Text>
        <Text style={styles.meta}>
          {menu.category}
          {menu.spicy ? " · เผ็ด" : ""}
        </Text>
      </View>
      <Text style={styles.price}>{menu.price} ฿</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", // ① วางลูกเรียงแนวนอน
    alignItems: "center", // ② จัดกึ่งกลางแนวตั้ง
    gap: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiBox: {
    width: 48,
    height: 48,
    borderRadius: 24, // ครึ่งหนึ่งของกว้าง = วงกลม
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: { fontSize: 24 },
  info: { flex: 1 }, // ③ กินพื้นที่ที่เหลือทั้งหมด ดันราคาไปชิดขวา
  name: { fontSize: 16, fontWeight: "bold", color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  price: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
});
