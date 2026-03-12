import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getChallenges } from "../services/supabaseService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ff9800",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6, color: "#333" },
  description: { fontSize: 14, color: "#555", marginBottom: 8 },
  meta: { fontSize: 12, color: "#666" },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },
});

export default function ChallengesScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await getChallenges({ status: "active", limitCount: 20 });
    setChallenges(list);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation?.navigate?.("ChallengeDetail", { challengeId: item.id, challenge: item })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.meta}>
        Goal: {item.goal} • Ends {item.endAt ? new Date(item.endAt).toLocaleDateString() : ""} • {(item.participantIds || []).length} joined
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
        Community challenges: complete goals for rewards and recognition.
      </Text>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active challenges yet.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#ff9800", marginTop: 8 }]}
        onPress={() => navigation?.navigate?.("CreateChallenge")}
      >
        <Text style={[styles.title, { color: "#fff", textAlign: "center" }]}>+ Create challenge</Text>
      </TouchableOpacity>
    </View>
  );
}
