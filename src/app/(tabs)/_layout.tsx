import { Tabs } from "expo-router";
import { Text } from "react-native";

import { COLORS } from "../../lib/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: "white",
        tabBarActiveTintColor: COLORS.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "กินในงบ",
          tabBarLabel: "หน้าแรก",
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "เพิ่มเมนู",
          tabBarIcon: () => <Text>➕</Text>,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "เกี่ยวกับ",
          tabBarIcon: () => <Text>ℹ️</Text>,
        }}
      />
    </Tabs>
  );
}
