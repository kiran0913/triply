// Community trip challenge: e.g. "Visit 3 National Parks in 30 Days"
export function createChallenge({
  title,
  description,
  goal, // e.g. "Visit 3 National Parks"
  goalCount = 3,
  goalUnit = "trips",
  startAt,
  endAt,
  createdByUserId,
  createdByUsername,
  rewardDescription = "Recognition & badge",
}) {
  return {
    title,
    description,
    goal,
    goalCount,
    goalUnit,
    startAt: startAt || new Date().toISOString(),
    endAt: endAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdByUserId,
    createdByUsername,
    rewardDescription,
    status: "active",
    participantIds: [],
    winnerIds: [],
    createdAt: new Date().toISOString(),
  };
}

// Participant progress: { userId, challengeId, completedCount, completedTripIds[], completedAt? }
export function createChallengeParticipation({ userId, challengeId }) {
  return {
    userId,
    challengeId,
    completedCount: 0,
    completedTripIds: [],
    joinedAt: new Date().toISOString(),
  };
}
