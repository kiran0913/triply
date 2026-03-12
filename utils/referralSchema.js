// Referral: user invites friends → unlock premium or travel gear discounts
export function generateReferralCode(userId) {
  const short = userId.slice(-6).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TB${short}${rnd}`;
}

export function createReferral({ referrerUserId, referredUserId, referralCode }) {
  return {
    referrerUserId,
    referredUserId,
    referralCode,
    createdAt: new Date().toISOString(),
    rewardClaimed: false,
  };
}
