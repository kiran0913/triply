import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import {
  getChallengeById,
  joinChallenge,
  getChallengeParticipation,
  getChallengeLeaderboard,
} from "../services/supabaseService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8, color: "#333" },
  description: { fontSize: 14, color: "#555", marginBottom: 12 },
  meta: { fontSize: 12, color: "#666", marginBottom: 8 },
  btn: { paddingVertical: 12, borderRadius: 8, backgroundColor: "#ff9800", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
});

export default function ChallengeDetailScreen({ route, navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { challengeId, challenge: initialChallenge } = route.params || {};
  const [challenge, setChallenge] = useState(initialChallenge || null);
  const [participation, setParticipation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!challengeId) return;
    getChallengeById(challengeId).then(setChallenge);
    if (user?.uid) {
      getChallengeParticipation(user.uid, challengeId).then(setParticipation);
    }
    getChallengeLeaderboard(challengeId).then(setLeaderboard);
  }, [challengeId, user?.uid]);

  const handleJoin = async () => {
    if (!user?.uid) return;
    try {
      const updated = await joinChallenge(challengeId, user.uid);
      setChallenge(updated);
      setParticipation(await getChallengeParticipation(user.uid, challengeId));
      Alert.alert("Joined!", "You're in. Complete the goal to compete for rewards.");
    } catch (e) {
      Alert.alert("Error", e.message || "Could not join.");
    }
  };

  if (!challenge) return null;

  const isParticipant = (challenge.participantIds || []).includes(user?.uid);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>
        <Text style={styles.meta}>
          Goal: {challenge.goal} • {challenge.goalCount} {challenge.goalUnit}
        </Text>
        <Text style={styles.meta}>
          Ends {challenge.endAt ? new Date(challenge.endAt).toLocaleDateString() : ""}
        </Text>
        <Text style={styles.meta}>Reward: {challenge.rewardDescription}</Text>
        {!isParticipant && user?.uid && (
          <TouchableOpacity style={styles.btn} onPress={handleJoin}>
            <Text style={styles.btnText}>Join challenge</Text>
          </TouchableOpacity>
        )}
        {isParticipant && (
          <Text style={{ marginTop: 8, color: "#2e7d32", fontWeight: "600" }}>✓ You're in</Text>
        )}
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        {leaderboard.length === 0 ? (
          <Text style={styles.meta}>No entries yet.</Text>
        ) : (
          leaderboard.slice(0, 10).map((p, i) => (
            <View key={p.id || i} style={styles.row}>
              <Text>#{i + 1} User {p.userId?.slice(-6)}</Text>
              <Text>{p.completedCount || 0} completed</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}
