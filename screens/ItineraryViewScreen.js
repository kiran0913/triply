import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { addItineraryToCalendar } from "../services/calendarService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#333" },
  viewToggle: { flexDirection: "row", marginBottom: 16, gap: 8 },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#e0e0e0" },
  toggleBtnActive: { backgroundColor: "#2196F3" },
  toggleText: { fontSize: 14, color: "#333" },
  toggleTextActive: { color: "#fff", fontWeight: "600" },
  timeline: {},
  dayCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  dayDate: { fontSize: 12, color: "#666", marginBottom: 4 },
  dayCity: { fontSize: 18, fontWeight: "600", color: "#333", marginBottom: 8 },
  activity: { fontSize: 14, color: "#555", marginLeft: 8, marginBottom: 2 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  calDay: {
    width: "30%",
    minWidth: 100,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  calDate: { fontSize: 12, color: "#2196F3", fontWeight: "600", marginBottom: 4 },
  calCity: { fontSize: 14, fontWeight: "600", color: "#333" },
  syncBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#4CAF50", alignSelf: "flex-start" },
  syncBtnText: { color: "#fff", fontWeight: "600" },
  syncNote: { fontSize: 12, color: "#666", marginTop: 8 },
});

export default function ItineraryViewScreen({ route }) {
  const { post, itinerary } = route.params || {};
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "calendar"
  const [syncStatus, setSyncStatus] = useState(null);
  const days = itinerary?.days || post?.itinerary?.days || [];

  const handleSyncCalendar = async () => {
    setSyncStatus("Syncing...");
    const res = await addItineraryToCalendar(itinerary || post?.itinerary, post?.title || "Trip");
    setSyncStatus(res.success ? "Added to calendar!" : res.error || "Failed");
  };

  if (!days.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No itinerary for this trip.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{post?.title || "Trip Itinerary"}</Text>
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === "timeline" && styles.toggleBtnActive]}
          onPress={() => setViewMode("timeline")}
        >
          <Text style={[styles.toggleText, viewMode === "timeline" && styles.toggleTextActive]}>
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === "calendar" && styles.toggleBtnActive]}
          onPress={() => setViewMode("calendar")}
        >
          <Text style={[styles.toggleText, viewMode === "calendar" && styles.toggleTextActive]}>
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "timeline" && (
        <View style={styles.timeline}>
          {days.map((day, i) => (
            <View key={i} style={styles.dayCard}>
              <Text style={styles.dayDate}>{day.date}</Text>
              <Text style={styles.dayCity}>{day.city}</Text>
              {(day.activities || []).map((act, j) => (
                <Text key={j} style={styles.activity}>• {act}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {viewMode === "calendar" && (
        <View style={styles.calendarGrid}>
          {days.map((day, i) => (
            <View key={i} style={styles.calDay}>
              <Text style={styles.calDate}>{day.date}</Text>
              <Text style={styles.calCity}>{day.city}</Text>
              <Text style={styles.activity} numberOfLines={2}>
                {(day.activities || []).join(", ")}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.syncBtn} onPress={handleSyncCalendar}>
        <Text style={styles.syncBtnText}>Sync to device calendar</Text>
      </TouchableOpacity>
      {syncStatus && <Text style={styles.syncNote}>{syncStatus}</Text>}
    </ScrollView>
  );
}
