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
import { SafeAreaView } from "react-native-safe-area-context";
import { createPost as createPostInDb } from "../services/supabaseService";
import { createPost } from "../utils/postSchema";
import { createItinerary as createItineraryObj } from "../utils/itinerarySchema";
import { INTEREST_TAGS, TRIP_PRIVACY } from "../utils/constants";
import { AuthContext } from "../context/AuthContext";
import { getUserProfile } from "../services/supabaseService";

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
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  tagActive: { backgroundColor: "#2196F3" },
  tagText: { fontSize: 14, color: "#333" },
  tagTextActive: { color: "#fff", fontWeight: "600" },
  dayCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e0e0e0" },
  dayTitle: { fontWeight: "600", marginBottom: 6 },
  row: { flexDirection: "row", gap: 8, marginBottom: 6 },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#2196F3", alignSelf: "flex-start" },
  btnSecondary: { backgroundColor: "#e0e0e0" },
  btnText: { color: "#fff", fontWeight: "600" },
  btnTextSecondary: { color: "#333" },
  submit: { marginTop: 24, marginBottom: 32, paddingVertical: 14, borderRadius: 8, backgroundColor: "#2196F3" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
});

function useItineraryDays(initial = [{ date: "", city: "", activities: "" }]) {
  const [days, setDays] = useState(initial);
  const addDay = () => setDays((d) => [...d, { date: "", city: "", activities: "" }]);
  const removeDay = (i) => setDays((d) => d.filter((_, idx) => idx !== i));
  const updateDay = (i, field, value) =>
    setDays((d) => d.map((day, idx) => (idx === i ? { ...day, [field]: value } : day)));
  const reset = () => setDays([{ date: "", city: "", activities: "" }]);
  return { days, addDay, removeDay, updateDay, reset };
}

const PRIVACY_OPTIONS = [
  { value: TRIP_PRIVACY.PUBLIC, label: "Public" },
  { value: TRIP_PRIVACY.FRIENDS_ONLY, label: "Friends only" },
  { value: TRIP_PRIVACY.PRIVATE, label: "Private" },
];

export default function CreatePostScreen() {
  const { user } = useContext(AuthContext) || {};
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [privacy, setPrivacy] = useState(TRIP_PRIVACY.PUBLIC);
  const [friendIds, setFriendIds] = useState([]);
  const { days, addDay, removeDay, updateDay, reset } = useItineraryDays();

  React.useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid).then((p) => setFriendIds(p?.friendIds || []));
  }, [user?.uid]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please add a trip title.");
      return;
    }
    const itinerary = createItineraryObj(
      days
        .filter((d) => d.date || d.city)
        .map((d) => ({
          date: d.date,
          city: d.city,
          activities: d.activities ? d.activities.split(",").map((a) => a.trim()).filter(Boolean) : [],
        }))
    );
    const post = createPost({
      userId: user?.uid || "demo123",
      username: user?.email?.split("@")[0] || "john_doe",
      location: location.trim() || "Unknown",
      title: title.trim(),
      description: description.trim(),
      imageUrl: "https://source.unsplash.com/300x200/?travel",
      coords: { latitude: 40.7128, longitude: -74.006 },
      interestTags: selectedTags,
      itinerary: itinerary.days.length ? itinerary : null,
      privacy,
      visibleToUserIds: privacy === TRIP_PRIVACY.FRIENDS_ONLY ? friendIds : [],
    });
    try {
      await createPostInDb({
        authorId: post.userId,
        title: post.title,
        description: post.description,
        destination: post.location,
        interestTags: post.interestTags,
        privacy: post.privacy,
        visibleToUserIds: post.visibleToUserIds,
        shareToken: post.shareToken,
        joinRequests: post.joinRequests,
      });
      Alert.alert("Done", "Trip post created.");
      setTitle("");
      setDescription("");
      setLocation("");
      setSelectedTags([]);
      reset();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create post.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }} edges={["top", "left", "right"]}>
      <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      <Text style={styles.sectionTitle}>Trip title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Bali 5-day trip"
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Describe your trip and what you're looking for"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.sectionTitle}>Location (city, country)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. NYC, NY"
        value={location}
        onChangeText={setLocation}
      />
      <Text style={styles.sectionTitle}>Privacy</Text>
      <View style={styles.tagRow}>
        {PRIVACY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.tag, privacy === opt.value && styles.tagActive]}
            onPress={() => setPrivacy(opt.value)}
          >
            <Text style={[styles.tagText, privacy === opt.value && styles.tagTextActive]} numberOfLines={1}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Interest tags (for matching)</Text>
      <View style={styles.tagRow}>
        {INTEREST_TAGS.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, active && styles.tagActive]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.sectionTitle}>Itinerary (optional multi-day plan)</Text>
      {days.map((day, i) => (
        <View key={i} style={styles.dayCard}>
          <Text style={styles.dayTitle}>Day {i + 1}</Text>
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={day.date}
            onChangeText={(v) => updateDay(i, "date", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={day.city}
            onChangeText={(v) => updateDay(i, "city", v)}
          />
          <TextInput
            style={styles.input}
            placeholder="Activities (comma-separated)"
            value={day.activities}
            onChangeText={(v) => updateDay(i, "activities", v)}
          />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => removeDay(i)}>
              <Text style={[styles.btnText, styles.btnTextSecondary]}>Remove day</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={addDay}>
        <Text style={[styles.btnText, styles.btnTextSecondary]}>+ Add day</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>Create Trip</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
