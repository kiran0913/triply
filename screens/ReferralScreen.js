import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, Share, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { getOrCreateReferralCode, getReferralsForUser } from "../services/supabaseService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  codeBox: { backgroundColor: "#e3f2fd", padding: 16, borderRadius: 8, marginBottom: 12 },
  codeText: { fontSize: 20, fontWeight: "bold", color: "#1976d2", letterSpacing: 2 },
  hint: { fontSize: 14, color: "#666", marginBottom: 12 },
  btn: { paddingVertical: 12, borderRadius: 8, backgroundColor: "#2196F3" },
  btnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  count: { fontSize: 16, color: "#333", marginTop: 8 },
});

export default function ReferralScreen() {
  const { user } = useContext(AuthContext) || {};
  const [code, setCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    getOrCreateReferralCode(user.uid).then(setCode);
    getReferralsForUser(user.uid).then((list) => setReferralCount(list.length));
  }, [user?.uid]);

  const shareLink = code ? `Join me on Travel Buddy! Use my code ${code} when you sign up.` : "";
  const handleShare = async () => {
    try {
      await Share.share({
        message: shareLink,
        title: "Travel Buddy invite",
      });
    } catch (e) {
      Alert.alert("Share", e.message || "Share failed.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invite friends</Text>
        <Text style={styles.hint}>
          Share your code. When friends sign up with it, you earn points and can unlock premium features or travel gear discounts.
        </Text>
        {code ? (
          <>
            <View style={styles.codeBox}>
              <Text style={styles.codeText} selectable>{code}</Text>
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleShare}>
              <Text style={styles.btnText}>Share invite</Text>
            </TouchableOpacity>
            <Text style={styles.count}>{referralCount} friend(s) joined with your code</Text>
          </>
        ) : (
          <Text style={styles.hint}>Loading your code...</Text>
        )}
      </View>
    </View>
  );
}
