// Review/rating left by one user for another (after trip or chat)
export const createReview = ({
  fromUserId,
  fromUsername,
  toUserId,
  rating, // 1-5
  comment = "",
  visibility = "public", // "public" | "private"
  tripId = null, // optional: which trip this was for
  createdAt = new Date().toISOString(),
}) => ({
  fromUserId,
  fromUsername,
  toUserId,
  rating: Math.min(5, Math.max(1, rating)),
  comment,
  visibility,
  tripId,
  createdAt,
});
