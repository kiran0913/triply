import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  linkBox: { backgroundColor: "#eee", padding: 12, borderRadius: 8, marginBottom: 12 },
  linkText: { fontSize: 14, color: "#333" },
  btn: { paddingVertical: 12, borderRadius: 8, backgroundColor: "#2196F3" },
  btnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
});

export default function ShareTripScreen({ route }) {
  const { post } = route.params || {};
  const shareToken = post?.shareToken;
  const baseUrl = "https://travelbuddy.app/trip"; // Replace with your deep link base
  const shareLink = shareToken ? `${baseUrl}?token=${shareToken}` : "";

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my trip: ${post?.title || "Trip"}\n${shareLink}`,
        title: "Trip invite",
        url: shareLink,
      });
    } catch (e) {
      Alert.alert("Share", e.message || "Share failed.");
    }
  };

  if (!shareToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>This trip is not private or share link not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share trip (private link)</Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
          Anyone with this link can view the trip.
        </Text>
        <View style={styles.linkBox}>
          <Text style={styles.linkText} selectable>{shareLink}</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleShare}>
          <Text style={styles.btnText}>Share link</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
