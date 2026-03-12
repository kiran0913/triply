import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getEventById, joinEvent } from "../services/supabaseService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8, color: "#333" },
  type: { fontSize: 14, color: "#4CAF50", marginBottom: 8 },
  description: { fontSize: 14, color: "#555", marginBottom: 12 },
  meta: { fontSize: 14, color: "#666", marginBottom: 6 },
  btn: { paddingVertical: 12, borderRadius: 8, backgroundColor: "#4CAF50", marginTop: 12 },
  btnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
});

export default function EventDetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { eventId, event: initialEvent } = route.params || {};
  const [event, setEvent] = useState(initialEvent || null);

  useEffect(() => {
    if (!eventId) return;
    getEventById(eventId).then(setEvent);
  }, [eventId]);

  const handleJoin = async () => {
    if (!user?.uid) return;
    try {
      const updated = await joinEvent(eventId, user.uid);
      setEvent(updated);
      Alert.alert("Joined!", "You're attending this event.");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not join.");
    }
  };

  if (!event) return null;

  const attendeeIds = event.attendeeIds || [];
  const isAttending = attendeeIds.includes(user?.uid);
  const isFull = attendeeIds.length >= (event.maxAttendees || 20);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.type}>{event.type}</Text>
        <Text style={styles.title}>{event.title}</Text>
        {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
        <Text style={styles.meta}>📍 {event.location}</Text>
        <Text style={styles.meta}>
          🕐 {event.startAt ? new Date(event.startAt).toLocaleString() : ""}
        </Text>
        <Text style={styles.meta}>
          👥 {attendeeIds.length} / {event.maxAttendees || 20} attending
        </Text>
        {!isAttending && user?.uid && !isFull && (
          <TouchableOpacity style={styles.btn} onPress={handleJoin}>
            <Text style={styles.btnText}>Join event</Text>
          </TouchableOpacity>
        )}
        {isAttending && <Text style={{ marginTop: 12, color: "#2e7d32", fontWeight: "600" }}>✓ You're attending</Text>}
      </View>
    </View>
  );
}
