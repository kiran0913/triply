/**
 * Push notification campaigns: trips near you, compatible matches, new trip in area, join requests.
 * Uses Firebase Cloud Messaging (FCM) when available. Install @react-native-firebase/messaging and configure.
 */

let messaging = null;
try {
  messaging = require("@react-native-firebase/messaging").default;
} catch (e) {
  // FCM not installed
}

const PREF_KEYS = {
  TRIPS_NEAR_ME: "notify_trips_near_me",
  COMPATIBLE_MATCHES: "notify_compatible_matches",
  NEW_TRIP_IN_AREA: "notify_new_trip_in_area",
  JOIN_REQUEST: "notify_join_request",
  CHALLENGE_UPDATES: "notify_challenge_updates",
  EVENT_REMINDERS: "notify_event_reminders",
};

const DEFAULT_PREFS = {
  [PREF_KEYS.TRIPS_NEAR_ME]: true,
  [PREF_KEYS.COMPATIBLE_MATCHES]: true,
  [PREF_KEYS.NEW_TRIP_IN_AREA]: true,
  [PREF_KEYS.JOIN_REQUEST]: true,
  [PREF_KEYS.CHALLENGE_UPDATES]: true,
  [PREF_KEYS.EVENT_REMINDERS]: true,
};

let storage = null;
function getStorage() {
  if (storage !== null) return storage;
  try {
    storage = require("@react-native-async-storage/async-storage").default;
  } catch (e) {
    storage = false;
  }
  return storage;
}

const PREFS_CACHE_KEY = "@TravelBuddy/notification_prefs";

export function isPushAvailable() {
  return !!messaging;
}

export async function requestNotificationPermission() {
  if (!messaging) return { granted: false };
  try {
    const authStatus = await messaging().requestPermission();
    return { granted: authStatus === messaging.AuthorizationStatus.AUTHORIZED };
  } catch (e) {
    return { granted: false, error: e.message };
  }
}

export async function getNotificationPrefs() {
  const s = getStorage();
  if (!s) return DEFAULT_PREFS;
  try {
    const raw = await s.getItem(PREFS_CACHE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_PREFS;
}

export async function setNotificationPref(key, value) {
  const prefs = await getNotificationPrefs();
  prefs[key] = Boolean(value);
  const s = getStorage();
  if (s) await s.setItem(PREFS_CACHE_KEY, JSON.stringify(prefs));
  return prefs;
}

export async function getFCMToken() {
  if (!messaging) return null;
  try {
    return await messaging().getToken();
  } catch (e) {
    return null;
  }
}

export { PREF_KEYS };
