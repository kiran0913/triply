import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getEvents } from "../services/supabaseService";
import { EVENT_TYPES } from "../utils/constants";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#333" },
  type: { fontSize: 12, color: "#4CAF50", marginBottom: 4 },
  meta: { fontSize: 14, color: "#555", marginBottom: 4 },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: "#e0e0e0" },
  filterBtnActive: { backgroundColor: "#4CAF50" },
  filterText: { fontSize: 14, color: "#333" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
});

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState(null);

  const load = useCallback(async () => {
    const list = await getEvents({ limitCount: 50, type: typeFilter || undefined });
    setEvents(list);
  }, [typeFilter]);

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
      onPress={() => navigation?.navigate?.("EventDetail", { eventId: item.id, event: item })}
    >
      <Text style={styles.type}>{item.type}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.location}</Text>
      <Text style={styles.meta}>
        {item.startAt ? new Date(item.startAt).toLocaleString() : ""} • {(item.attendeeIds || []).length} attending
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, !typeFilter && styles.filterBtnActive]}
          onPress={() => setTypeFilter(null)}
        >
          <Text style={[styles.filterText, !typeFilter && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {EVENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterBtn, typeFilter === t && styles.filterBtnActive]}
            onPress={() => setTypeFilter(typeFilter === t ? null : t)}
          >
            <Text style={[styles.filterText, typeFilter === t && styles.filterTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
        Local meetups: picnic, hike, co-working. Great for community building.
      </Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No upcoming events.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <TouchableOpacity
        style={[styles.card, { backgroundColor: "#4CAF50", marginTop: 8 }]}
        onPress={() => navigation?.navigate?.("CreateEvent")}
      >
        <Text style={[styles.title, { color: "#fff", textAlign: "center" }]}>+ Create event</Text>
      </TouchableOpacity>
    </View>
  );
}
