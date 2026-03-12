import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../context/AuthContext";
import { getAverageRating, getUserProfile, setUserProfile } from "../services/supabaseService";
import RatingStars from "../components/RatingStars";
import VerifiedBadge from "../components/VerifiedBadge";
import PointsAndBadges from "../components/PointsAndBadges";
import { getCachedPosts, loadOfflineCache, clearOfflineCache } from "../services/offlineService";
import { requestCalendarPermission, isCalendarAvailable } from "../services/calendarService";
import { isVerificationAvailable } from "../services/verifiedIdService";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#333" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#2196F3", marginTop: 8 },
  btnSecondary: { backgroundColor: "#e0e0e0" },
  btnText: { color: "#fff", fontWeight: "600" },
  btnTextSecondary: { color: "#333" },
  email: { fontSize: 14, color: "#666", marginBottom: 16 },
  offlineCount: { fontSize: 14, color: "#555" },
  syncNote: { fontSize: 12, color: "#666", marginTop: 8 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#e0e0e0" },
  avatarPlaceholder: { justifyContent: "center", alignItems: "center" },
  avatarInitials: { fontSize: 20, fontWeight: "700", color: "#333" },
});

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const [rating, setRating] = useState(null);
  const [offlineCount, setOfflineCount] = useState(0);
  const [calendarGranted, setCalendarGranted] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    const [avg, cached, perm, prof] = await Promise.all([
      getAverageRating(user.uid).catch(() => null),
      loadOfflineCache().then(() => getCachedPosts().length),
      isCalendarAvailable() ? requestCalendarPermission().then((r) => r.granted) : Promise.resolve(false),
      getUserProfile(user.uid).catch(() => null),
    ]);
    setRating(avg);
    setOfflineCount(cached);
    setCalendarGranted(perm);
    setProfile(prof);
  }, [user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openReviews = () => {
    if (user?.uid) navigation.navigate("ReviewsList", { userId: user.uid });
  };

  const openCalendarSync = async () => {
    const res = await requestCalendarPermission();
    setCalendarGranted(res.granted);
  };

  const clearOffline = () => {
    clearOfflineCache().then(() => {
      setOfflineCount(0);
    });
  };

  const verifiedId = profile?.verifiedId === true;
  const hasQuiz = profile?.quizAnswers && Object.keys(profile.quizAnswers).length > 0;
  const photoUri = profile?.photoUri || user?.photoURL || null;

  const pickProfilePhoto = async () => {
    if (!user?.uid) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permission required", "Please allow photo library access to set a profile photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets?.[0]?.uri;
    if (!uri) return;
    await setUserProfile(user.uid, { photoUri: uri });
    setProfile((p) => ({ ...(p || {}), photoUri: uri }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentInsetAdjustmentBehavior="automatic"
      >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.avatarRow}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitials}>
                {(user?.email?.[0] || "U").toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.email}>{user?.email || "Not signed in"}</Text>
            <TouchableOpacity onPress={pickProfilePhoto}>
              <Text style={{ color: "#007BFF", fontWeight: "600" }}>
                {photoUri ? "Change profile photo" : "Add profile photo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.row, { marginBottom: 4 }]}>
          <VerifiedBadge isVerified={profile?.verifiedUser} verifiedId={verifiedId} />
        </View>
        {rating && (
          <View style={styles.row}>
            <RatingStars rating={rating.average} count={rating.count} />
            <TouchableOpacity onPress={openReviews}>
              <Text style={styles.btnTextSecondary}>View reviews</Text>
            </TouchableOpacity>
          </View>
        )}
        {!rating && (
          <TouchableOpacity onPress={openReviews}>
            <Text style={styles.btnTextSecondary}>View my reviews</Text>
          </TouchableOpacity>
        )}
        {hasQuiz && (
          <View style={styles.row}>
            <Text style={styles.offlineCount}>Compatibility quiz completed</Text>
            <TouchableOpacity onPress={() => navigation?.navigate?.("CompatibilityQuiz")}>
              <Text style={styles.btnTextSecondary}>Edit quiz</Text>
            </TouchableOpacity>
          </View>
        )}
        {user?.uid && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Points & badges</Text>
            <PointsAndBadges userId={user.uid} />
            <TouchableOpacity onPress={() => navigation?.navigate?.("Challenges")} style={{ marginTop: 8 }}>
              <Text style={styles.btnTextSecondary}>Challenges</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referral rewards</Text>
        <Text style={styles.offlineCount}>
          Invite friends → unlock premium features or travel gear discounts.
        </Text>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation?.navigate?.("Referral")}>
          <Text style={[styles.btnText, styles.btnTextSecondary]}>Invite friends</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push notifications</Text>
        <Text style={styles.offlineCount}>
          Trips near you, compatible matches, new trip in your area, join requests.
        </Text>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation?.navigate?.("NotificationPreferences")}>
          <Text style={[styles.btnText, styles.btnTextSecondary]}>Notification preferences</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events & meetups</Text>
        <Text style={styles.offlineCount}>
          Create or join local events: picnic, hike, co-working. Great for community building.
        </Text>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation?.navigate?.("Events")}>
          <Text style={[styles.btnText, styles.btnTextSecondary]}>Browse events</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verified ID</Text>
        <Text style={styles.offlineCount}>
          Adds extra trust: "Verified ID" badge. Partner with Stripe Identity or Persona.
        </Text>
        {verifiedId ? (
          <Text style={[styles.offlineCount, { color: "#2e7d32", fontWeight: "600" }]}>Verified ID ✓</Text>
        ) : isVerificationAvailable() ? (
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => {}}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Verify ID</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.syncNote}>Verification coming soon. Integrate Stripe Identity or Persona.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety check-in</Text>
        <Text style={styles.offlineCount}>
          Set a safety timer when meeting someone. If you don't check in, your emergency contact is alerted.
        </Text>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation?.navigate?.("SafetyCheckIn")}>
          <Text style={[styles.btnText, styles.btnTextSecondary]}>Set safety timer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compatibility quiz</Text>
        <Text style={styles.offlineCount}>
          Take the quiz for better matching. "86% compatible" badges on profiles and posts.
        </Text>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation?.navigate?.("CompatibilityQuiz")}>
          <Text style={[styles.btnText, styles.btnTextSecondary]}>{hasQuiz ? "Edit quiz" : "Take quiz"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calendar sync</Text>
        <Text style={styles.offlineCount}>
          Sync your trips with Google Calendar or iOS Calendar for meetup planning.
        </Text>
        {isCalendarAvailable() ? (
          <>
            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={openCalendarSync}>
              <Text style={[styles.btnText, styles.btnTextSecondary]}>
                {calendarGranted === true ? "Calendar access granted" : "Grant calendar access"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.syncNote}>
              When viewing an itinerary, use "Sync to device calendar" to add events.
            </Text>
          </>
        ) : (
          <Text style={styles.syncNote}>
            Install react-native-calendar-events and rebuild to enable calendar sync.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline mode</Text>
        <Text style={styles.offlineCount}>
          {offlineCount} trip(s) saved for offline. Use "Save offline" on any trip in Discover.
        </Text>
        {offlineCount > 0 && (
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={clearOffline}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Clear offline cache</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
