/**
 * Traveler verification logic.
 * Levels: basic | verified | trusted
 */

export type VerificationLevel = "basic" | "verified" | "trusted";

export interface VerificationStatus {
  level: VerificationLevel;
  emailVerified: boolean;
  profileCompleted: boolean;
  photoVerified: boolean;
  idSubmitted: boolean;   // placeholder
  trustedBadge: boolean;  // verified or trusted
}

export function computeProfileCompleted(user: {
  name?: string | null;
  bio?: string | null;
  location?: string | null;
  interests?: unknown;
  travelStyle?: unknown;
}): boolean {
  const hasName = !!user.name?.trim();
  const hasBio = !!user.bio?.trim();
  const hasLocation = !!user.location?.trim();
  const hasInterests = Array.isArray(user.interests) && user.interests.length > 0;
  const hasTravelStyle = Array.isArray(user.travelStyle) && user.travelStyle.length > 0;
  return hasName && hasBio && hasLocation && (hasInterests || hasTravelStyle);
}

export function computeVerificationLevel(user: {
  emailVerified?: Date | null;
  profileCompleted?: boolean;
  photoVerified?: boolean;
  verificationLevel?: string | null;
}): VerificationLevel {
  const emailOk = !!user.emailVerified;
  const profileOk = user.profileCompleted ?? false;
  const photoOk = user.photoVerified ?? false;

  if (user.verificationLevel === "trusted") return "trusted";
  if (emailOk && profileOk && photoOk) return "verified";
  if (emailOk) return "basic";
  return "basic";
}

export function getVerificationStatus(user: {
  emailVerified?: Date | null;
  profileCompleted?: boolean;
  photoVerified?: boolean;
  verificationLevel?: string | null;
}): VerificationStatus {
  const emailVerified = !!user.emailVerified;
  const profileCompleted = user.profileCompleted ?? false;
  const photoVerified = user.photoVerified ?? false;
  const level = computeVerificationLevel(user);
  return {
    level,
    emailVerified,
    profileCompleted,
    photoVerified,
    idSubmitted: false, // placeholder
    trustedBadge: level === "verified" || level === "trusted",
  };
}
