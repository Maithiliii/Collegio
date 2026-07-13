import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShadowBox from "./ui/ShadowBox";
import { BackChevronIcon } from "./ui/Icon";
import { colors, font } from "../theme/tokens";

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  bottomPadding?: number;
  children?: React.ReactNode;
};

export default function Header({ title, onBackPress, bottomPadding = 16, children }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 20, paddingBottom: bottomPadding }]}>
      {onBackPress ? (
        <View style={styles.titleRow}>
          <ShadowBox
            onPress={onBackPress}
            bg={colors.white}
            radius={18}
            shadowOffset={2}
            contentStyle={styles.backBtnContent}
          >
            <BackChevronIcon />
          </ShadowBox>
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.yellow,
    borderBottomWidth: 3,
    borderBottomColor: colors.ink,
    paddingHorizontal: 20,
    gap: 12,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtnContent: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontFamily: font.extrabold, color: colors.ink },
});
