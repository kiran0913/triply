// Onboarding / matching preferences saved to users/{uid}
// Fields: onboardingComplete (boolean), matchingPreferences (object)

export const ONBOARDING_FIELDS = {
  ONBOARDING_COMPLETE: "onboardingComplete",
  MATCHING_PREFERENCES: "matchingPreferences",
};

export const MATCHING_PREFERENCES_DEFAULTS = {
  interestTags: [], // subset of INTEREST_TAGS
};
