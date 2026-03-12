/**
 * In-app calendar & sync with device calendar (Google Calendar / iOS Calendar).
 * Uses react-native-calendar-events when available. Install: npm install react-native-calendar-events
 * and link / rebuild. On iOS you need NSCalendarsUsageDescription in Info.plist.
 */

let RNCalendarEvents = null;
try {
  RNCalendarEvents = require("react-native-calendar-events");
} catch (e) {
  // Module not installed
}

export async function requestCalendarPermission() {
  if (!RNCalendarEvents) return { granted: false, error: "Calendar module not installed" };
  try {
    const status = await RNCalendarEvents.requestPermissions();
    return { granted: status === "authorized" };
  } catch (err) {
    return { granted: false, error: err.message };
  }
}

export async function getCalendars() {
  if (!RNCalendarEvents) return [];
  try {
    return await RNCalendarEvents.findCalendars();
  } catch (e) {
    return [];
  }
}

/** Create an event on the device calendar (syncs to Google/iOS Calendar) */
export async function addTripToCalendar({ title, startDate, endDate, location, notes }) {
  if (!RNCalendarEvents) {
    return { success: false, error: "Calendar module not installed" };
  }
  try {
    const perm = await requestCalendarPermission();
    if (!perm.granted) return { success: false, error: "Permission denied" };
    const start = startDate instanceof Date ? startDate.toISOString() : startDate;
    const end = endDate instanceof Date ? endDate.toISOString() : endDate;
    await RNCalendarEvents.saveEvent(title, {
      startDate: start,
      endDate: end || start,
      location: location || "",
      notes: notes || "",
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** Add multiple days (itinerary) as one or more calendar events */
export async function addItineraryToCalendar(itinerary, tripTitle) {
  if (!itinerary?.days?.length) return { success: false, error: "No itinerary days" };
  const results = [];
  for (const day of itinerary.days) {
    const start = new Date(day.date);
    const end = new Date(day.date);
    end.setHours(23, 59, 59, 999);
    const res = await addTripToCalendar({
      title: `${tripTitle}: ${day.city || "Day"}`,
      startDate: start,
      endDate: end,
      location: day.city,
      notes: (day.activities || []).join(", "),
    });
    results.push(res);
  }
  const allOk = results.every((r) => r.success);
  return { success: allOk, results };
}

export function isCalendarAvailable() {
  return !!RNCalendarEvents;
}
