// Single day in an itinerary
export const createItineraryDay = ({ date, city, activities = [] }) => ({
  date, // ISO date string YYYY-MM-DD
  city,
  activities, // array of strings, e.g. ["Beach", "Museum", "Dinner"]
});

// Full multi-day itinerary attached to a trip post
export const createItinerary = (days = []) => ({
  days: days.map((d) =>
    typeof d.date !== "undefined"
      ? createItineraryDay(d)
      : createItineraryDay({ date: "", city: "", activities: [] })
  ),
  updatedAt: new Date().toISOString(),
});
