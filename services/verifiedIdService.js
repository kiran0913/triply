/**
 * Verified ID / Background Check (optional tier).
 * Partner with Stripe Identity (https://stripe.com/identity) or Persona (https://withpersona.com).
 * This module is a placeholder: integrate your chosen provider's SDK/API and call setUserProfile(verifiedId: true).
 */

// Placeholder: in production, redirect to Stripe Identity or Persona verification flow,
// then on success call onVerified() which should update user profile with verifiedId: true.
export async function startVerification(userId) {
  // TODO: Open Stripe Identity or Persona verification URL / SDK
  // Example: Stripe Identity - create VerificationSession, redirect user to verification_url
  // On webhook verification_session.verified, set users/{userId}.verifiedId = true
  return {
    success: false,
    message: "Integrate Stripe Identity or Persona. See https://stripe.com/identity or https://withpersona.com",
  };
}

export function isVerificationAvailable() {
  return false; // Set true when provider is integrated
}
