import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors, Shadows, Spacing } from "../../theme";

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    ...Shadows.card,
  },
});

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

