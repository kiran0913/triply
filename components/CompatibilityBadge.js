import React from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#e8f5e9",
  },
  text: { fontSize: 12, color: "#2e7d32", fontWeight: "600" },
});

export default function CompatibilityBadge({ score }) {
  if (score == null || score < 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{score}% compatible</Text>
    </View>
  );
}
