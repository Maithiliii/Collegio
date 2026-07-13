import React from "react";
import { Pressable, View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors } from "../../theme/tokens";

type ShadowBoxProps = {
  onPress?: () => void;
  disabled?: boolean;
  bg?: string;
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
  /** Hard offset shadow size in px. 0 = no shadow (chips, plain rows). */
  shadowOffset?: number;
  /** Shadow offset while pressed. Defaults to the "Bold Badge" spec's collapse behavior. */
  pressedShadowOffset?: number;
  /** Use a press-scale (tab bar `+`) instead of the translate+shadow-collapse interaction. */
  scaleOnPress?: number;
  /** Layout styles (flex, width, margin...) applied to the outer pressable. */
  style?: StyleProp<ViewStyle>;
  /** Visual styles (padding, flexDirection, alignItems, gap...) applied to the inner content box. */
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export default function ShadowBox({
  onPress,
  disabled,
  bg = colors.white,
  borderColor = colors.ink,
  borderWidth = 2.5,
  radius = 12,
  shadowOffset = 0,
  pressedShadowOffset,
  scaleOnPress,
  style,
  contentStyle,
  children,
}: ShadowBoxProps) {
  const pressedOffset =
    pressedShadowOffset ?? (shadowOffset <= 2.5 ? 0 : shadowOffset - 2);

  return (
    <Pressable onPress={onPress} disabled={disabled} style={style}>
      {({ pressed }) => {
        const activeShadow = pressed ? pressedOffset : shadowOffset;
        const contentTransform = scaleOnPress
          ? [{ scale: pressed ? scaleOnPress : 1 }]
          : shadowOffset > 0
          ? [{ translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }]
          : [];

        return (
          <View style={styles.wrapper}>
            {shadowOffset > 0 && (
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: colors.ink,
                    borderRadius: radius,
                    transform: [{ translateX: activeShadow }, { translateY: activeShadow }],
                  },
                ]}
              />
            )}
            <View
              style={[
                {
                  backgroundColor: bg,
                  borderWidth,
                  borderColor,
                  borderRadius: radius,
                  transform: contentTransform,
                },
                contentStyle,
              ]}
            >
              {children}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "relative" },
});
