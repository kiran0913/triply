// Travel companion compatibility quiz for better matching
// Questions: pace, preferences, budget, etc. Stored per user; score computed between two users.

export const COMPATIBILITY_QUIZ_QUESTIONS = [
  { id: "pace", label: "Travel pace", options: ["Relaxed", "Moderate", "Fast-paced", "Mixed"] },
  { id: "budget", label: "Budget style", options: ["Budget", "Moderate", "Luxury", "Flexible"] },
  { id: "accommodation", label: "Accommodation", options: ["Hostels", "Hotels", "Airbnb", "Mixed"] },
  { id: "planning", label: "Planning style", options: ["Planned ahead", "Spontaneous", "Half and half"] },
  { id: "social", label: "Social preference", options: ["Solo time", "Always together", "Balance"] },
  { id: "activities", label: "Preferred activities", options: ["Adventure", "Culture", "Relaxation", "Mix"] },
  { id: "wake", label: "Wake time", options: ["Early bird", "Sleep in", "Flexible"] },
  { id: "food", label: "Food priority", options: ["Local/street", "Restaurants", "Flexible"] },
];

// User's quiz answers: { questionId: optionIndex } e.g. { pace: 0, budget: 1 }
export const createQuizAnswers = (answers = {}) => ({
  ...answers,
  updatedAt: new Date().toISOString(),
});

// Compute compatibility % between two users' quiz answers (0-100)
export function computeCompatibility(answersA, answersB) {
  if (!answersA || !answersB || typeof answersA !== "object" || typeof answersB !== "object") {
    return null;
  }
  const ids = COMPATIBILITY_QUIZ_QUESTIONS.map((q) => q.id);
  let match = 0;
  let total = 0;
  for (const id of ids) {
    const a = answersA[id];
    const b = answersB[id];
    if (a === undefined || b === undefined) continue;
    total += 1;
    if (a === b) match += 1;
  }
  if (total === 0) return null;
  return Math.round((match / total) * 100);
}
