/**
 * Offline mode: cache trip posts and mark items for "downloaded" viewing.
 * Uses in-memory + AsyncStorage when available so users can view saved trips in low-signal areas.
 */

const CACHE_KEY_POSTS = "@TravelBuddy/offline_posts";
const CACHE_KEY_DOWNLOADED_IDS = "@TravelBuddy/downloaded_post_ids";

let memoryCache = { posts: [], downloadedIds: new Set() };
let storage = null;

// Lazy-load AsyncStorage (optional dependency)
function getStorage() {
  if (storage !== null) return storage;
  try {
    storage = require("@react-native-async-storage/async-storage").default;
  } catch (e) {
    storage = false;
  }
  return storage;
}

export async function loadOfflineCache() {
  const s = getStorage();
  if (!s) return;
  try {
    const [postsJson, idsJson] = await Promise.all([
      s.getItem(CACHE_KEY_POSTS),
      s.getItem(CACHE_KEY_DOWNLOADED_IDS),
    ]);
    if (postsJson) {
      const parsed = JSON.parse(postsJson);
      memoryCache.posts = Array.isArray(parsed) ? parsed : [];
    }
    if (idsJson) {
      const ids = JSON.parse(idsJson);
      memoryCache.downloadedIds = new Set(Array.isArray(ids) ? ids : []);
    }
  } catch (e) {
    console.warn("Offline cache load failed", e);
  }
}

export async function saveOfflineCache() {
  const s = getStorage();
  if (!s) return;
  try {
    await Promise.all([
      s.setItem(CACHE_KEY_POSTS, JSON.stringify(memoryCache.posts)),
      s.setItem(
        CACHE_KEY_DOWNLOADED_IDS,
        JSON.stringify([...memoryCache.downloadedIds])
      ),
    ]);
  } catch (e) {
    console.warn("Offline cache save failed", e);
  }
}

export function getCachedPosts() {
  return [...memoryCache.posts];
}

export function isDownloaded(postId) {
  return memoryCache.downloadedIds.has(postId);
}

/** Add a single post to offline cache and mark as downloaded */
export async function downloadPostForOffline(post) {
  const id = post.id || post.title;
  memoryCache.downloadedIds.add(id);
  const existing = memoryCache.posts.findIndex((p) => (p.id || p.title) === id);
  const entry = { ...post, id };
  if (existing >= 0) memoryCache.posts[existing] = entry;
  else memoryCache.posts.push(entry);
  await saveOfflineCache();
}

/** Replace full list of cached posts (e.g. after fetching feed) */
export async function setCachedPosts(posts) {
  memoryCache.posts = posts.map((p) => ({ ...p, id: p.id || p.title }));
  await saveOfflineCache();
}

/** Remove a post from offline downloads */
export async function removeOfflineDownload(postId) {
  memoryCache.downloadedIds.delete(postId);
  memoryCache.posts = memoryCache.posts.filter((p) => (p.id || p.title) !== postId);
  await saveOfflineCache();
}

export async function clearOfflineCache() {
  memoryCache = { posts: [], downloadedIds: new Set() };
  const s = getStorage();
  if (s) {
    try {
      await s.multiRemove([CACHE_KEY_POSTS, CACHE_KEY_DOWNLOADED_IDS]);
    } catch (e) {
      console.warn("Offline cache clear failed", e);
    }
  }
}
