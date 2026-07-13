import React, { useCallback, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, font } from "../../theme/tokens";

export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  return { toast, showToast };
}

type ToastProps = { message: string | null };

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <View style={styles.toast} pointerEvents="none">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 96,
    backgroundColor: colors.toastBg,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    zIndex: 50,
    elevation: 8,
  },
  text: { color: colors.toastFg, fontSize: 13.5, fontFamily: font.bold, textAlign: "center" },
});
