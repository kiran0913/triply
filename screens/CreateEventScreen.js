import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { createEvent } from "../services/supabaseService";
import { createEvent as createEventSchema } from "../utils/eventSchema";
import { EVENT_TYPES } from "../utils/constants";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginTop: 16, marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  typeBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: "#e0e0e0" },
  typeBtnActive: { backgroundColor: "#4CAF50" },
  typeText: { fontSize: 14, color: "#333" },
  typeTextActive: { color: "#fff", fontWeight: "600" },
  submit: { marginTop: 24, marginBottom: 32, paddingVertical: 14, borderRadius: 8, backgroundColor: "#4CAF50" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
});

export default function CreateEventScreen({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const [title, setTitle] = useState("");
  const [type, setType] = useState(EVENT_TYPES[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("20");

  const handleSubmit = async () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert("Required", "Please add title and location.");
      return;
    }
    const eventData = createEventSchema({
      title: title.trim(),
      type,
      description: description.trim(),
      location: location.trim(),
      startAt: startAt || new Date().toISOString(),
      creatorUserId: user?.uid,
      creatorUsername: user?.email?.split("@")[0] || "User",
      maxAttendees: parseInt(maxAttendees, 10) || 20,
    });
    try {
      await createEvent(eventData);
      Alert.alert("Created", "Event created.");
      navigation?.goBack?.();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create event.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Event title</Text>
      <TextInput style={styles.input} placeholder="e.g. Central Park Picnic" value={title} onChangeText={setTitle} />
      <Text style={styles.sectionTitle}>Type</Text>
      <View style={styles.typeRow}>
        {EVENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeBtn, type === t && styles.typeBtnActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, { minHeight: 60 }]}
        placeholder="What's the plan?"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.sectionTitle}>Location</Text>
      <TextInput style={styles.input} placeholder="Address or place name" value={location} onChangeText={setLocation} />
      <Text style={styles.sectionTitle}>Date & time (ISO or leave blank for now)</Text>
      <TextInput style={styles.input} placeholder="e.g. 2025-03-15T14:00:00" value={startAt} onChangeText={setStartAt} />
      <Text style={styles.sectionTitle}>Max attendees</Text>
      <TextInput
        style={styles.input}
        placeholder="20"
        value={maxAttendees}
        onChangeText={setMaxAttendees}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>Create event</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
