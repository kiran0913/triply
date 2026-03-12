import React from "react";
import { Text, StyleSheet } from "react-native";
import { TRIP_PRIVACY } from "../utils/constants";

const styles = StyleSheet.create({
  text: { fontSize: 11, color: "#666", marginLeft: 4 },
});

const LABELS = {
  [TRIP_PRIVACY.PUBLIC]: "Public",
  [TRIP_PRIVACY.FRIENDS_ONLY]: "Friends only",
  [TRIP_PRIVACY.PRIVATE]: "Private",
};

export default function PrivacyBadge({ privacy }) {
  if (!privacy || privacy === TRIP_PRIVACY.PUBLIC) return null;
  return <Text style={styles.text}>• {LABELS[privacy]}</Text>;
}
