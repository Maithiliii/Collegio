import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CompositeNavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootStackParamList } from "../App";
import { MainTabParamList } from "../navigation/MainTabs";
import { HomeTabIcon, GoodsTabIcon, ServicesTabIcon, LostFoundTabIcon, PlusIcon } from "./ui/Icon";
import { colors, font } from "../theme/tokens";

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabButtonProps = {
  active: boolean;
  label: string;
  Icon: React.FC<{ color?: string }>;
  onPress: () => void;
};

function TabButton({ active, label, Icon, onPress }: TabButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Icon color={active ? colors.ink : colors.tabInactive} />
      {active && <Text style={styles.tabLabel}>{label}</Text>}
    </Pressable>
  );
}

export default function TabBar() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute();

  return (
    <View style={styles.bar}>
      <TabButton active={route.name === "Home"} label="Home" Icon={HomeTabIcon} onPress={() => navigation.navigate("Main", { screen: "Home" })} />
      <TabButton active={route.name === "Goods"} label="Goods" Icon={GoodsTabIcon} onPress={() => navigation.navigate("Main", { screen: "Goods" })} />
      <Pressable
        onPress={() => navigation.navigate("Post")}
        style={({ pressed }) => [styles.plusBtn, pressed && styles.plusBtnPressed]}
      >
        <PlusIcon />
      </Pressable>
      <TabButton active={route.name === "Services"} label="Services" Icon={ServicesTabIcon} onPress={() => navigation.navigate("Main", { screen: "Services" })} />
      <TabButton
        active={route.name === "LostFound"}
        label="Lost & Found"
        Icon={LostFoundTabIcon}
        onPress={() => navigation.navigate("Main", { screen: "LostFound" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 14,
    marginBottom: 6,
    backgroundColor: colors.ink,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tab: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 13, paddingVertical: 8, paddingHorizontal: 11 },
  tabActive: { backgroundColor: colors.yellow },
  tabLabel: { fontSize: 11.5, fontFamily: font.extrabold, color: colors.ink },
  plusBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.orange, alignItems: "center", justifyContent: "center" },
  plusBtnPressed: { transform: [{ scale: 0.93 }] },
});
