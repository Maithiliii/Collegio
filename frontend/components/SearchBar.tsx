import React from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { SearchIcon, ClearIcon } from "./ui/Icon";
import { colors, font } from "../theme/tokens";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export default function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <View pointerEvents="none" style={styles.backdrop} />
      <View style={styles.bar}>
        <SearchIcon />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} style={styles.clearBtn}>
            <ClearIcon />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
  backdrop: {
    position: "absolute",
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: colors.ink,
    borderRadius: 12,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.ink,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 11,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
});
