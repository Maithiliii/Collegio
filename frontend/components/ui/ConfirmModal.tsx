import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import ShadowBox from "./ShadowBox";
import { colors, font, radii } from "../../theme/tokens";

type ConfirmModalProps = {
  visible: boolean;
  heading: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmModal({
  visible,
  heading,
  body,
  onCancel,
  onConfirm,
  confirmLabel = "Yes, do it",
  cancelLabel = "Cancel",
}: ConfirmModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.scrim}>
        <View style={styles.panelWrapper}>
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.ink, borderRadius: radii.modal, transform: [{ translateX: 5 }, { translateY: 5 }] },
            ]}
          />
          <View style={styles.panel}>
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.body}>{body}</Text>
            <View style={styles.row}>
              <ShadowBox style={styles.flexOne} contentStyle={styles.btnContent} onPress={onCancel} bg={colors.white} radius={radii.button}>
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </ShadowBox>
              <ShadowBox
                style={styles.flexOne}
                contentStyle={styles.btnContent}
                onPress={onConfirm}
                bg={colors.orange}
                radius={radii.button}
                shadowOffset={2.5}
              >
                <Text style={styles.confirmText}>{confirmLabel}</Text>
              </ShadowBox>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: "center", alignItems: "center", padding: 30 },
  panelWrapper: { position: "relative", width: "100%" },
  panel: {
    backgroundColor: colors.cream,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: radii.modal,
    paddingVertical: 22,
    paddingHorizontal: 20,
    gap: 8,
  },
  heading: { fontSize: 18, fontFamily: font.extrabold, color: colors.ink },
  body: { fontSize: 13.5, fontFamily: font.regular, color: colors.bodySecondary, lineHeight: 19 },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  flexOne: { flex: 1 },
  btnContent: { paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 14, fontFamily: font.extrabold, color: colors.ink },
  confirmText: { fontSize: 14, fontFamily: font.extrabold, color: colors.white },
});
