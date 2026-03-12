import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import {
  createSafetyCheckIn as createSafetyCheckInRecord,
  getActiveSafetyCheckIns,
  safetyCheckIn as doCheckIn,
  setUserProfile,
  getUserProfile,
} from "../services/supabaseService";
import { SAFETY_CHECKIN_HOURS } from "../utils/constants";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  hourBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#e0e0e0" },
  hourBtnActive: { backgroundColor: "#2196F3" },
  hourText: { fontSize: 14, color: "#333" },
  hourTextActive: { color: "#fff", fontWeight: "600" },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#2196F3", marginTop: 8 },
  btnSecondary: { backgroundColor: "#e0e0e0" },
  btnText: { color: "#fff", fontWeight: "600" },
  btnTextSecondary: { color: "#333" },
  card: { backgroundColor: "#fff3e0", padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: "#ff9800" },
  cardTitle: { fontWeight: "600", marginBottom: 4 },
  cardMeta: { fontSize: 12, color: "#666", marginBottom: 8 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#666" },
});

export default function SafetyCheckInScreen({ route, navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { meetUserId, meetUsername, postId, postTitle } = route.params || {};
  const [hours, setHours] = useState(2);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [activeList, setActiveList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadActive = useCallback(async () => {
    if (!user?.uid) return;
    const list = await getActiveSafetyCheckIns(user.uid);
    setActiveList(list);
  }, [user?.uid]);

  useEffect(() => {
    loadActive();
    if (user?.uid) {
      getUserProfile(user.uid).then((p) => {
        if (p?.emergencyContactName) setEmergencyName(p.emergencyContactName);
        if (p?.emergencyContactPhone) setEmergencyPhone(p.emergencyContactPhone);
      });
    }
  }, [user?.uid, loadActive]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadActive();
    setRefreshing(false);
  }, [loadActive]);

  const handleStartCheckIn = async () => {
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      Alert.alert("Required", "Please enter emergency contact name and phone.");
      return;
    }
    const dueAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    await createSafetyCheckInRecord({
      userId: user?.uid,
      meetUserId: meetUserId || null,
      meetUsername: meetUsername || "Someone",
      postId: postId || null,
      postTitle: postTitle || null,
      dueAt,
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyPhone.trim(),
      status: "active",
    });
    await setUserProfile(user.uid, { emergencyContactName: emergencyName.trim(), emergencyContactPhone: emergencyPhone.trim() });
    Alert.alert("Safety timer set", `Check in within ${hours} hour(s) or your emergency contact will be notified.`);
    loadActive();
  };

  const handleCheckIn = async (id) => {
    await doCheckIn(id);
    Alert.alert("Checked in!", "You're safe. Your emergency contact will not be notified.");
    loadActive();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set safety check-in</Text>
        <Text style={styles.emptyText}>
          When meeting someone, set a timer. If you don't check in by then, your emergency contact will be alerted.
        </Text>
        <Text style={{ fontSize: 14, marginTop: 12, marginBottom: 8 }}>Check in within</Text>
        <View style={styles.row}>
          {SAFETY_CHECKIN_HOURS.map((h) => (
            <TouchableOpacity
              key={h}
              style={[styles.hourBtn, hours === h && styles.hourBtnActive]}
              onPress={() => setHours(h)}
            >
              <Text style={[styles.hourText, hours === h && styles.hourTextActive]}>{h}h</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Emergency contact name"
          value={emergencyName}
          onChangeText={setEmergencyName}
        />
        <TextInput
          style={styles.input}
          placeholder="Emergency contact phone"
          value={emergencyPhone}
          onChangeText={setEmergencyPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.btn} onPress={handleStartCheckIn}>
          <Text style={styles.btnText}>Start safety timer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active check-ins</Text>
        {activeList.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No active safety timers.</Text>
          </View>
        ) : (
          activeList.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>Meet with {item.meetUsername}</Text>
              <Text style={styles.cardMeta}>
                Check in by {item.dueAt ? new Date(item.dueAt).toLocaleString() : ""}
              </Text>
              <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => handleCheckIn(item.id)}>
                <Text style={[styles.btnText, styles.btnTextSecondary]}>I'm safe – Check in</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
