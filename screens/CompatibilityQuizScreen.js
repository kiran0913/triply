import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getUserProfile, saveQuizAnswers } from "../services/supabaseService";
import { COMPATIBILITY_QUIZ_QUESTIONS } from "../utils/quizSchema";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  question: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#333" },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  option: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#e0e0e0" },
  optionActive: { backgroundColor: "#2196F3" },
  optionText: { fontSize: 14, color: "#333" },
  optionTextActive: { color: "#fff", fontWeight: "600" },
  btn: { paddingVertical: 14, borderRadius: 8, backgroundColor: "#2196F3", marginTop: 16 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600", textAlign: "center" },
  done: { fontSize: 14, color: "#2e7d32", marginTop: 12, fontWeight: "600" },
});

export default function CompatibilityQuizScreen() {
  const { user } = useContext(AuthContext) || {};
  const [answers, setAnswers] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getUserProfile(user.uid).then((p) => {
      if (p?.quizAnswers && typeof p.quizAnswers === "object") {
        setAnswers(p.quizAnswers);
      }
      setLoaded(true);
    });
  }, [user?.uid]);

  const setAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSave = async () => {
    const total = COMPATIBILITY_QUIZ_QUESTIONS.length;
    const answered = Object.keys(answers).length;
    if (answered < total) {
      Alert.alert("Complete quiz", `You've answered ${answered}/${total}. Finish all for better matching.`);
    }
    await saveQuizAnswers(user?.uid, answers);
    Alert.alert("Saved", "Your preferences are saved. You'll see compatibility % with others on trips.");
  };

  if (!loaded) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travel companion quiz</Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
          Answer for better matching. "86% compatible" badges will show on profiles and posts.
        </Text>
        {COMPATIBILITY_QUIZ_QUESTIONS.map((q) => (
          <View key={q.id} style={{ marginBottom: 20 }}>
            <Text style={styles.question}>{q.label}</Text>
            <View style={styles.optionRow}>
              {q.options.map((opt, idx) => {
                const active = answers[q.id] === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => setAnswer(q.id, idx)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={styles.btnText}>Save answers</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
