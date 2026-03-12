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
import { createChallenge } from "../services/supabaseService";
import { createChallenge as createChallengeSchema } from "../utils/challengeSchema";

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
  submit: { marginTop: 24, marginBottom: 32, paddingVertical: 14, borderRadius: 8, backgroundColor: "#ff9800" },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
});

export default function CreateChallengeScreen({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [goalCount, setGoalCount] = useState("3");
  const [goalUnit, setGoalUnit] = useState("trips");
  const [rewardDescription, setRewardDescription] = useState("Recognition & badge");
  const [daysUntilEnd, setDaysUntilEnd] = useState("30");

  const handleSubmit = async () => {
    if (!title.trim() || !goal.trim()) {
      Alert.alert("Required", "Please add title and goal.");
      return;
    }
    const endAt = new Date(Date.now() + (parseInt(daysUntilEnd, 10) || 30) * 24 * 60 * 60 * 1000).toISOString();
    const data = createChallengeSchema({
      title: title.trim(),
      description: description.trim(),
      goal: goal.trim(),
      goalCount: parseInt(goalCount, 10) || 3,
      goalUnit: goalUnit.trim() || "trips",
      endAt,
      createdByUserId: user?.uid,
      createdByUsername: user?.email?.split("@")[0] || "User",
      rewardDescription: rewardDescription.trim(),
    });
    try {
      await createChallenge(data);
      Alert.alert("Created", "Challenge created.");
      navigation?.goBack?.();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create challenge.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Challenge title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Visit 3 National Parks in 30 Days"
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.sectionTitle}>Description</Text>
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Describe the challenge"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.sectionTitle}>Goal (short label)</Text>
      <TextInput style={styles.input} placeholder="e.g. Visit 3 National Parks" value={goal} onChangeText={setGoal} />
      <Text style={styles.sectionTitle}>Goal count</Text>
      <TextInput style={styles.input} placeholder="3" value={goalCount} onChangeText={setGoalCount} keyboardType="number-pad" />
      <Text style={styles.sectionTitle}>Goal unit</Text>
      <TextInput style={styles.input} placeholder="trips" value={goalUnit} onChangeText={setGoalUnit} />
      <Text style={styles.sectionTitle}>Reward description</Text>
      <TextInput
        style={styles.input}
        placeholder="Recognition & badge"
        value={rewardDescription}
        onChangeText={setRewardDescription}
      />
      <Text style={styles.sectionTitle}>Days until end</Text>
      <TextInput style={styles.input} placeholder="30" value={daysUntilEnd} onChangeText={setDaysUntilEnd} keyboardType="number-pad" />
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>Create challenge</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
