import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getPostByShareToken } from "../services/supabaseService";
import PostCard from "../components/PostCard";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  loading: { padding: 32, alignItems: "center" },
  error: { fontSize: 16, color: "#c62828", textAlign: "center", padding: 24 },
});

export default function OpenSharedTripScreen({ route, navigation }) {
  const { shareToken } = route.params || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shareToken) {
      setError("Invalid link");
      setLoading(false);
      return;
    }
    getPostByShareToken(shareToken)
      .then((p) => {
        setPost(p);
        setError(p ? null : "Trip not found");
      })
      .catch(() => setError("Could not load trip"))
      .finally(() => setLoading(false));
  }, [shareToken]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error || !post) {
    return <Text style={styles.error}>{error || "Trip not found"}</Text>;
  }

  return (
    <View style={styles.container}>
      <PostCard
        post={post}
        onViewItinerary={
          post.itinerary?.days?.length
            ? () => navigation?.navigate?.("Itinerary", { post, itinerary: post.itinerary })
            : undefined
        }
      />
    </View>
  );
}
