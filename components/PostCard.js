import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import VerifiedBadge from "./VerifiedBadge";
import BlockReportButton from "./BlockReportButton";
import CompatibilityBadge from "./CompatibilityBadge";
import MutualConnectionsBadge from "./MutualConnectionsBadge";
import PrivacyBadge from "./PrivacyBadge";
import { TRIP_PRIVACY } from "../utils/constants";

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 18, fontWeight: "bold", color: "#333", flex: 1 },
  description: { fontSize: 14, color: "#555", marginBottom: 8 },
  image: { height: 200, borderRadius: 8, backgroundColor: "#eee" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
  },
  tagText: { fontSize: 12, color: "#1976d2" },
  actions: { flexDirection: "row", marginTop: 12, gap: 8, flexWrap: "wrap" },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#2196F3" },
  btnSecondary: { backgroundColor: "#e0e0e0" },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  btnTextSecondary: { color: "#333" },
});

export default function PostCard({
  post,
  isDownloaded = false,
  onDownload,
  onRemoveDownload,
  onViewItinerary,
  onRateUser,
  onShareTrip,
  compatibilityScore = null,
  mutualConnections = null,
  whyThisMatch = null,
}) {
  const hasItinerary = post.itinerary?.days?.length > 0;
  const tags = post.interestTags || [];
  const mutual = mutualConnections || { mutualTripCount: 0, mutualTrips: [] };
  const matchedTags = whyThisMatch?.matchedTags || [];

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={1}>
          {post.title}{" "}
        </Text>
        <VerifiedBadge isVerified={post.verifiedUser} verifiedId={post.verifiedId} />
        <PrivacyBadge privacy={post.privacy} />
      </View>
      {matchedTags.length > 0 && (
        <View style={{ marginBottom: 6, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "#E8F4FD", borderRadius: 8 }}>
          <Text style={{ fontSize: 12, color: "#1565C0", fontWeight: "600" }}>Why this match</Text>
          <Text style={{ fontSize: 13, color: "#333", marginTop: 2 }}>
            Matches your interests: {matchedTags.join(", ")}
          </Text>
        </View>
      )}
      {(compatibilityScore != null || mutual.mutualTripCount > 0) && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
          {compatibilityScore != null && <CompatibilityBadge score={compatibilityScore} />}
          <MutualConnectionsBadge mutualTripCount={mutual.mutualTripCount} mutualTrips={mutual.mutualTrips} />
        </View>
      )}
      {post.location ? (
        <Text style={styles.description}>{post.location}</Text>
      ) : null}
      <Text style={styles.description} numberOfLines={3}>
        {post.description}
      </Text>
      {post.imageUrl ? (
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : null}
      {tags.length > 0 && (
        <View style={styles.tagsRow}>
          {tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={() => {}}>
          <Text style={styles.btnText}>Join Trip</Text>
        </TouchableOpacity>
        {hasItinerary && onViewItinerary && (
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onViewItinerary}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>View Itinerary</Text>
          </TouchableOpacity>
        )}
        {onRateUser && (
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onRateUser}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Rate user</Text>
          </TouchableOpacity>
        )}
        {onShareTrip && post.privacy === TRIP_PRIVACY.PRIVATE && (
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onShareTrip}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Share trip</Text>
          </TouchableOpacity>
        )}
        {onDownload && (
          <TouchableOpacity
            style={[styles.btn, styles.btnSecondary]}
            onPress={isDownloaded ? onRemoveDownload : onDownload}
          >
            <Text style={[styles.btnText, styles.btnTextSecondary]}>
              {isDownloaded ? "Remove offline" : "Save offline"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <BlockReportButton postUserId={post.userId} />
    </View>
  );
}
