import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, radii, spacing, shadow } from "../theme";

type Props = { children: React.ReactNode; style?: ViewStyle };

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadow.card
  }
});
