import React from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  text: { fontSize: 12, color: "#666" },
  highlight: { color: "#1976d2", fontWeight: "600" },
});

export default function MutualConnectionsBadge({ mutualTripCount, mutualTrips = [] }) {
  if (mutualTripCount == null || mutualTripCount === 0) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.text}>
        <Text style={styles.highlight}>{mutualTripCount} mutual trip{mutualTripCount !== 1 ? "s" : ""}</Text>
        {mutualTrips.length > 0 && mutualTrips[0]?.title && ` • ${mutualTrips[0].title}${mutualTrips.length > 1 ? " + more" : ""}`}
      </Text>
    </View>
  );
}
