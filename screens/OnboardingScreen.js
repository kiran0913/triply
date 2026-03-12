import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";
import { setUserProfile } from "../services/supabaseService";
import { INTEREST_TAGS } from "../utils/constants";
import { ONBOARDING_FIELDS, MATCHING_PREFERENCES_DEFAULTS } from "../utils/onboardingSchema";
import { Colors } from "../theme/colors";
import { Spacing } from "../theme/spacing";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.screen },
  inner: { flex: 1, padding: Spacing.lg, paddingTop: Spacing.xl },
  title: { fontSize: 24, fontWeight: "700", color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: Spacing.xl },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.border,
  },
  tagActive: { backgroundColor: Colors.primary },
  tagText: { fontSize: 15, color: Colors.text },
  tagTextActive: { color: "#fff", fontWeight: "600" },
  button: {
    marginTop: "auto",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  loading: { padding: 24, alignItems: "center" },
});

export default function OnboardingScreen({ onComplete }) {
  const { user } = useContext(AuthContext) || {};
  const [interestTags, setInterestTags] = useState([]);
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag) => {
    setInterestTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFinish = async () => {
    if (!user?.uid) return;
    setSaving(true);

    const payload = {
      [ONBOARDING_FIELDS.ONBOARDING_COMPLETE]: true,
      [ONBOARDING_FIELDS.MATCHING_PREFERENCES]: {
        ...MATCHING_PREFERENCES_DEFAULTS,
        interestTags,
      },
    };

    const saveWithTimeout = () =>
      Promise.race([
        setUserProfile(user.uid, payload),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 10000)
        ),
      ]);

    try {
      await saveWithTimeout();
      onComplete?.();
    } catch (e) {
      console.warn("Onboarding save failed", e);
      if (e?.message === "timeout") {
        Alert.alert(
          "Taking too long",
          "We couldn't save in time. You can continue anyway and set preferences in Profile later.",
          [{ text: "Continue", onPress: () => { onComplete?.(); } }]
        );
      } else {
        Alert.alert(
          "Could not save",
          "Check your connection and try again, or continue and set preferences in Profile later.",
          [{ text: "Try again", onPress: () => handleFinish() }, { text: "Continue anyway", onPress: () => { onComplete?.(); } }]
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.inner}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Set your travel preferences</Text>
        <Text style={styles.subtitle}>
          We’ll use these to recommend trips that match what you like. You can change them later in Profile.
        </Text>

        <Text style={styles.sectionLabel}>What interests you?</Text>
        <View style={styles.tagsWrap}>
          {INTEREST_TAGS.map((tag) => {
            const active = interestTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, active && styles.tagActive]}
                onPress={() => toggleTag(tag)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <View style={styles.loading}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <Text style={styles.buttonText}>Finish</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
