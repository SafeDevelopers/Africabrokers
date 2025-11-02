import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from "react-native";
import { colors, radii, spacing } from "../theme";

type Props = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "ghost";
  leftIcon?: string; // kept for API compatibility, not rendered in fallback
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Button({ title, onPress, variant = "primary", leftIcon, style, textStyle }: Props) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity onPress={onPress} style={[styles.base, isPrimary ? styles.primary : styles.ghost, style]}>
      {/* Intentionally not rendering vector icons in Expo Go fallback to avoid native Animated issues */}
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md
  },
  primary: {
    backgroundColor: colors.brand.primary
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.brand.primary
  },
  text: { fontWeight: "700" },
  textPrimary: { color: "#fff" },
  textGhost: { color: colors.brand.primary }
});
