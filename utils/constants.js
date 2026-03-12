// Interest tags for filtering and matching
export const INTEREST_TAGS = [
  "Beach",
  "Hiking",
  "Budget",
  "Luxury",
  "Adventure",
  "Culture",
  "Food",
  "Nightlife",
  "Solo",
  "Group",
  "Family",
  "Photography",
  "Wellness",
  "Road Trip",
  "Backpacking",
];

// Rating visibility options
export const RATING_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
};

// Trip privacy levels (US market safety & trust)
export const TRIP_PRIVACY = {
  PUBLIC: "public",           // Anyone can see and request to join
  FRIENDS_ONLY: "friends_only", // Restrict visibility to friends
  PRIVATE: "private",         // Hidden unless shared via link
};

// Verified ID / background check tier (Stripe Identity, Persona, etc.)
export const VERIFICATION_TIER = {
  NONE: "none",
  VERIFIED_ID: "verified_id",
};

// Safety check-in timer presets (hours)
export const SAFETY_CHECKIN_HOURS = [1, 2, 4, 8];

// --- Gamification ---
export const POINTS = {
  VERIFIED_POST: 50,
  COMPLETED_TRIP: 100,
  HELPFUL_REVIEW: 25,
  JOINED_TRIP: 20,
  CREATED_EVENT: 30,
  JOINED_CHALLENGE: 10,
  CHALLENGE_WINNER: 200,
  REFERRAL: 75,
};

export const BADGES = {
  LOCAL_GUIDE: { id: "local_guide", label: "Local Guide", minPoints: 500, icon: "📍" },
  EXPLORER: { id: "explorer", label: "Explorer", minPoints: 1000, icon: "🧭" },
  TRUSTED_COMPANION: { id: "trusted_companion", label: "Trusted Companion", minPoints: 750, icon: "🤝" },
  EARLY_ADOPTER: { id: "early_adopter", label: "Early Adopter", minPoints: 200, icon: "🌟" },
  CHALLENGE_CHAMP: { id: "challenge_champ", label: "Challenge Champ", minPoints: 0, requiresWin: true, icon: "🏆" },
};

// --- Trip challenges ---
export const CHALLENGE_STATUS = { ACTIVE: "active", ENDED: "ended", UPCOMING: "upcoming" };

// --- In-app events / meetups ---
export const EVENT_TYPES = ["Picnic", "Hike", "Co-working", "City tour", "Brunch", "Other"];
