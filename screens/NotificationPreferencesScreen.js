import React, { useState, useEffect } from "react";
import { View, Text, Switch, ScrollView, StyleSheet } from "react-native";
import {
  getNotificationPrefs,
  setNotificationPref,
  requestNotificationPermission,
  PREF_KEYS,
  isPushAvailable,
} from "../services/notificationService";

const LABELS = {
  [PREF_KEYS.TRIPS_NEAR_ME]: "Trips near me",
  [PREF_KEYS.COMPATIBLE_MATCHES]: "Compatible matches nearby",
  [PREF_KEYS.NEW_TRIP_IN_AREA]: "New trip posted in your area",
  [PREF_KEYS.JOIN_REQUEST]: "Someone wants to join your trip",
  [PREF_KEYS.CHALLENGE_UPDATES]: "Challenge updates",
  [PREF_KEYS.EVENT_REMINDERS]: "Event reminders",
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  label: { fontSize: 16, color: "#333", flex: 1 },
  note: { fontSize: 12, color: "#666", marginTop: 8 },
});

export default function NotificationPreferencesScreen() {
  const [prefs, setPrefs] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getNotificationPrefs().then((p) => {
      setPrefs(p);
      setLoaded(true);
    });
  }, []);

  const toggle = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await setNotificationPref(key, value);
  };

  if (!loaded) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push notification campaigns</Text>
        <Text style={styles.note}>
          Get notified about trips near you, compatible matches, and re-engagement alerts.
        </Text>
        {Object.entries(LABELS).map(([key, label]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Switch
              value={Boolean(prefs[key] !== false && prefs[key] !== "false")}
              onValueChange={(v) => toggle(key, !!v)}
            />
          </View>
        ))}
      </View>
      {!isPushAvailable() && (
        <Text style={styles.note}>
          Install @react-native-firebase/messaging and configure FCM for push notifications.
        </Text>
      )}
    </ScrollView>
  );
}
