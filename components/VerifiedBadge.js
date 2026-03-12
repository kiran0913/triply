import React from "react";
import { View, Text, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  badge: { fontSize: 12, color: "#1976d2" },
  verifiedId: { fontSize: 11, color: "#2e7d32", fontWeight: "600", marginLeft: 2 },
});

export default function VerifiedBadge({ isVerified, verifiedId = false }) {
  if (!isVerified && !verifiedId) return null;
  return (
    <View style={styles.row}>
      {isVerified && <Text style={styles.badge}>✔️</Text>}
      {verifiedId && (
        <Text style={styles.verifiedId}>Verified ID</Text>
      )}
    </View>
  );
}
