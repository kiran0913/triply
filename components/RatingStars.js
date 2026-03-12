import React from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  star: { fontSize: 16, color: "#ddd" },
  starActive: { color: "#ffc107" },
  text: { fontSize: 14, color: "#666", marginLeft: 4 },
});

export default function RatingStars({ rating, count, size = 16, showCount = true }) {
  const r = typeof rating === "number" ? rating : 0;
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <View style={styles.row}>
      {[...Array(full)].map((_, i) => (
        <Text key={`f-${i}`} style={[styles.star, styles.starActive, { fontSize: size }]}>★</Text>
      ))}
      {half && <Text style={[styles.star, styles.starActive, { fontSize: size }]}>★</Text>}
      {[...Array(empty)].map((_, i) => (
        <Text key={`e-${i}`} style={[styles.star, { fontSize: size }]}>★</Text>
      ))}
      {showCount && count != null && (
        <Text style={styles.text}>({count})</Text>
      )}
    </View>
  );
}
