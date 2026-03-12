// Points earned for actions; stored in users/{userId}.points and points_history
export const POINTS_REASONS = {
  VERIFIED_POST: "verified_post",
  COMPLETED_TRIP: "completed_trip",
  HELPFUL_REVIEW: "helpful_review",
  JOINED_TRIP: "joined_trip",
  CREATED_EVENT: "created_event",
  JOINED_CHALLENGE: "joined_challenge",
  CHALLENGE_WINNER: "challenge_winner",
  REFERRAL: "referral",
};

export function createPointsEntry({ userId, amount, reason, refId = null }) {
  return {
    userId,
    amount,
    reason,
    refId, // postId, challengeId, eventId, etc.
    createdAt: new Date().toISOString(),
  };
}
