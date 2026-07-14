import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import ShadowBox from "./ShadowBox";
import { colors, font, radii } from "../../theme/tokens";

type InfoModalProps = {
  visible: boolean;
  heading: string;
  body: string;
  onClose: () => void;
  closeLabel?: string;
};

export default function InfoModal({ visible, heading, body, onClose, closeLabel = "Got it" }: InfoModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
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
            <ShadowBox
              onPress={onClose}
              bg={colors.orange}
              radius={radii.button}
              shadowOffset={2.5}
              contentStyle={styles.btnContent}
              style={styles.button}
            >
              <Text style={styles.closeText}>{closeLabel}</Text>
            </ShadowBox>
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
  button: { marginTop: 10 },
  btnContent: { paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 14, fontFamily: font.extrabold, color: colors.white },
});
