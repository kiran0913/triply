import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { addReview } from "../services/supabaseService";
import { createReview } from "../utils/reviewSchema";
import { RATING_VISIBILITY } from "../utils/constants";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 16, color: "#333" },
  starsRow: { flexDirection: "row", marginBottom: 20, gap: 8 },
  star: { padding: 4 },
  starText: { fontSize: 32, color: "#ddd" },
  starTextActive: { color: "#ffc107" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 80,
    marginBottom: 16,
  },
  visibilityRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  visBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#e0e0e0" },
  visBtnActive: { backgroundColor: "#2196F3" },
  visText: { fontSize: 14, color: "#333" },
  visTextActive: { color: "#fff", fontWeight: "600" },
  submit: { paddingVertical: 14, borderRadius: 8, backgroundColor: "#2196F3" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
});

export default function RateUserScreen({ route, navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { toUserId, toUsername, tripId } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState(RATING_VISIBILITY.PUBLIC);

  const handleSubmit = async () => {
    if (rating < 1) {
      Alert.alert("Select rating", "Please choose 1–5 stars.");
      return;
    }
    const review = createReview({
      fromUserId: user?.uid,
      fromUsername: user?.email?.split("@")[0] || "User",
      toUserId,
      toUsername: toUsername || "User",
      rating,
      comment,
      visibility,
      tripId,
    });
    try {
      await addReview(review);
      Alert.alert("Thanks!", "Your review was submitted.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to submit review.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate {toUsername || "this user"}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} style={styles.star} onPress={() => setRating(n)}>
            <Text style={[styles.starText, n <= rating && styles.starTextActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Optional comment (visible if public)"
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Text style={{ fontSize: 14, marginBottom: 8, color: "#666" }}>Visibility</Text>
      <View style={styles.visibilityRow}>
        <TouchableOpacity
          style={[styles.visBtn, visibility === RATING_VISIBILITY.PUBLIC && styles.visBtnActive]}
          onPress={() => setVisibility(RATING_VISIBILITY.PUBLIC)}
        >
          <Text style={[styles.visText, visibility === RATING_VISIBILITY.PUBLIC && styles.visTextActive]}>
            Public
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.visBtn, visibility === RATING_VISIBILITY.PRIVATE && styles.visBtnActive]}
          onPress={() => setVisibility(RATING_VISIBILITY.PRIVATE)}
        >
          <Text style={[styles.visText, visibility === RATING_VISIBILITY.PRIVATE && styles.visTextActive]}>
            Private
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit review</Text>
      </TouchableOpacity>
    </View>
  );
}
