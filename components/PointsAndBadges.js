import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { getUserPoints, getUnlockedBadges } from "../services/supabaseService";
import { BADGES } from "../utils/constants";

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  points: { fontSize: 18, fontWeight: "bold", color: "#333" },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: "#fff3e0" },
  badgeText: { fontSize: 14 },
});

export default function PointsAndBadges({ userId }) {
  const [points, setPoints] = useState(0);
  const [badgeIds, setBadgeIds] = useState([]);

  useEffect(() => {
    if (!userId) return;
    getUserPoints(userId).then(setPoints);
    getUnlockedBadges(userId).then(setBadgeIds);
  }, [userId]);

  const badgeList = badgeIds
    .map((id) => Object.values(BADGES).find((b) => b.id === id))
    .filter(Boolean);

  return (
    <View style={styles.row}>
      <Text style={styles.points}>{points} pts</Text>
      {badgeList.map((b) => (
        <View key={b.id} style={styles.badge}>
          <Text style={styles.badgeText}>{b.icon} {b.label}</Text>
        </View>
      ))}
    </View>
  );
}
