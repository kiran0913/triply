import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import PostCard from "../components/PostCard";
import FilterChips from "../components/FilterChips";
import {
  getPosts,
  getRecommendedPosts,
  getUserProfile,
  getCompatibilityScore,
  getMutualConnections,
} from "../services/supabaseService";
import { AuthContext } from "../context/AuthContext";
import {
  getCachedPosts,
  loadOfflineCache,
  isDownloaded,
  downloadPostForOffline,
  removeOfflineDownload,
} from "../services/offlineService";

const FEED_MODE = { ALL: "all", RECOMMENDED: "recommended" };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { padding: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 16 },
  modeRow: { flexDirection: "row", marginTop: 4, marginBottom: 12, gap: 12 },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  modeChipActive: { backgroundColor: "#007BFF" },
  modeChipText: { fontSize: 14, color: "#333", fontWeight: "500" },
  modeChipTextActive: { color: "#fff" },
  list: { paddingBottom: 24 },
  empty: { padding: 32, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  offlineText: { fontSize: 12, color: "#e65100", marginLeft: 6 },
});

export default function FeedScreen({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [matchReasons, setMatchReasons] = useState({}); // { postId: { matchedTags } } for Recommended mode
  const [feedMode, setFeedMode] = useState(FEED_MODE.ALL);
  const [selectedTag, setSelectedTag] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [offlineCached, setOfflineCached] = useState([]);
  const [viewOffline, setViewOffline] = useState(false);
  const [postEnrichment, setPostEnrichment] = useState({}); // { postId: { verifiedId, compatibilityScore, mutualConnections } }

  const loadPosts = useCallback(async () => {
    try {
      if (feedMode === FEED_MODE.RECOMMENDED && user?.uid) {
        const { posts: data, matchReasons: reasons } = await getRecommendedPosts({
          userId: user.uid,
          limitCount: 50,
        });
        setPosts(data);
        setMatchReasons(reasons || {});
      } else {
        const data = await getPosts({
          interestTag: selectedTag || undefined,
          limitCount: 50,
          currentUserId: user?.uid || undefined,
        });
        setPosts(data);
        setMatchReasons({});
      }
      if (!user?.uid) {
        setPostEnrichment({});
        return;
      }
      const enrich = {};
      const slice = data.slice(0, 10);
      await Promise.all(
        slice.map(async (post) => {
          try {
            const [authorProfile, compatibility, mutual] = await Promise.all([
              getUserProfile(post.userId),
              getCompatibilityScore(user.uid, post.userId),
              getMutualConnections(user.uid, post.userId),
            ]);
            enrich[post.id] = {
              verifiedId: authorProfile?.verifiedId === true,
              compatibilityScore: compatibility ?? null,
              mutualConnections: mutual ?? { mutualTripCount: 0, mutualTrips: [] },
            };
          } catch (_) {
            enrich[post.id] = { verifiedId: false, compatibilityScore: null, mutualConnections: { mutualTripCount: 0, mutualTrips: [] } };
          }
        })
      );
      setPostEnrichment((prev) => ({ ...prev, ...enrich }));
    } catch (e) {
      console.warn("Feed load failed", e);
      setPosts([]);
      setMatchReasons({});
    }
  }, [feedMode, selectedTag, user?.uid]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOfflineCache();
    setOfflineCached(getCachedPosts());
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  useFocusEffect(
    useCallback(() => {
      loadOfflineCache().then(() => setOfflineCached(getCachedPosts()));
      loadPosts();
    }, [loadPosts])
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const displayPosts = viewOffline ? offlineCached : posts;
  const hasOffline = offlineCached.length > 0;

  const renderItem = ({ item }) => {
    const en = postEnrichment[item.id] || {};
    const postWithVerified = { ...item, verifiedId: en.verifiedId ?? item.verifiedId };
    return (
      <PostCard
        post={postWithVerified}
        isDownloaded={isDownloaded(item.id)}
        onDownload={() => downloadPostForOffline(item).then(onRefresh)}
        onRemoveDownload={() => removeOfflineDownload(item.id).then(onRefresh)}
        onViewItinerary={
          item.itinerary?.days?.length
            ? () => navigation?.navigate?.("Itinerary", { post: item, itinerary: item.itinerary })
            : undefined
        }
        onRateUser={
          navigation?.navigate
            ? () =>
                navigation.navigate("RateUser", {
                  toUserId: item.userId,
                  toUsername: item.username,
                  tripId: item.id,
                })
            : undefined
        }
        onShareTrip={
          item.privacy === "private" && navigation?.navigate
            ? () => navigation.navigate("ShareTrip", { post: item })
            : undefined
        }
        compatibilityScore={en.compatibilityScore ?? null}
        mutualConnections={en.mutualConnections ?? null}
        whyThisMatch={matchReasons[item.id] || null}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Trips</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeChip, feedMode === FEED_MODE.ALL && styles.modeChipActive]}
            onPress={() => setFeedMode(FEED_MODE.ALL)}
          >
            <Text style={[styles.modeChipText, feedMode === FEED_MODE.ALL && styles.modeChipTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeChip, feedMode === FEED_MODE.RECOMMENDED && styles.modeChipActive]}
            onPress={() => setFeedMode(FEED_MODE.RECOMMENDED)}
          >
            <Text style={[styles.modeChipText, feedMode === FEED_MODE.RECOMMENDED && styles.modeChipTextActive]}>Recommended</Text>
          </TouchableOpacity>
        </View>
        {feedMode === FEED_MODE.ALL && (
          <FilterChips selectedTag={selectedTag} onSelectTag={setSelectedTag} />
        )}
        {hasOffline && (
          <TouchableOpacity
            style={styles.offlineBadge}
            onPress={() => setViewOffline(!viewOffline)}
          >
            <Text style={styles.offlineText}>
              {viewOffline ? "Show online feed" : `View offline (${offlineCached.length} saved)`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id || item.title || String(Math.random())}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: 24 + insets.bottom + 72 }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {viewOffline ? "No offline trips saved." : "No trips yet. Create one!"}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}
