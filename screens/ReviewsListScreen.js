import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getReviewsForUser } from "../services/supabaseService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  author: { fontSize: 14, fontWeight: "600", color: "#333" },
  date: { fontSize: 12, color: "#666" },
  stars: { fontSize: 14, color: "#ffc107", marginBottom: 4 },
  comment: { fontSize: 14, color: "#555" },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },
});

export default function ReviewsListScreen({ route }) {
  const { userId } = route.params || {};
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!userId) return;
    getReviewsForUser(userId, { publicOnly: true })
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.author}>{item.fromUsername}</Text>
        <Text style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
        </Text>
      </View>
      <Text style={styles.stars}>{"★".repeat(item.rating)}</Text>
      {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id || item.createdAt + item.fromUserId}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No public reviews yet.</Text>
          </View>
        }
      />
    </View>
  );
}
