import { createItinerary } from "./itinerarySchema";
import { TRIP_PRIVACY } from "./constants";

export function generateShareToken() {
  return "tb_" + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
}

// Post object format (trip post with optional itinerary, tags, and privacy)
export const createPost = ({
  userId,
  username,
  location,
  title,
  description,
  imageUrl,
  coords,
  interestTags = [],
  itinerary = null,
  privacy = TRIP_PRIVACY.PUBLIC,
  shareToken = null,
  visibleToUserIds = [], // for friends_only: list of friend user IDs who can see
}) => ({
  userId,
  username,
  title,
  description,
  location,
  coords,
  imageUrl,
  interestTags,
  itinerary: itinerary || createItinerary([]),
  privacy,
  shareToken: shareToken || (privacy === TRIP_PRIVACY.PRIVATE ? generateShareToken() : null),
  visibleToUserIds: privacy === TRIP_PRIVACY.FRIENDS_ONLY ? visibleToUserIds : [],
  createdAt: new Date().toISOString(),
  verifiedUser: false,
  verifiedId: false,
  joinRequests: [],
  blockedBy: [],
});
