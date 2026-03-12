import React, { useState, useEffect, useContext } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getUserProfile } from "../services/supabaseService";
import MainStack from "./MainStack";
import OnboardingScreen from "../screens/OnboardingScreen";

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F7F7" },
  text: { marginTop: 12, fontSize: 16, color: "#666" },
});

export default function OnboardingGate() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getUserProfile(user.uid)
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.uid]);

  const handleOnboardingComplete = () => {
    setProfile((prev) => (prev ? { ...prev, onboardingComplete: true } : { onboardingComplete: true }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.text}>Loading…</Text>
      </View>
    );
  }

  if (profile?.onboardingComplete) {
    return <MainStack />;
  }

  return <OnboardingScreen onComplete={handleOnboardingComplete} />;
}
