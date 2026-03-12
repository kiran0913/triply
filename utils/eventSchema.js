// In-app event / meetup: picnic, hike, co-working, etc.
export function createEvent({
  title,
  type, // Picnic, Hike, Co-working, etc.
  description = "",
  location,
  coords = null,
  startAt,
  endAt = null,
  creatorUserId,
  creatorUsername,
  maxAttendees = 20,
}) {
  return {
    title,
    type,
    description,
    location,
    coords,
    startAt: startAt || new Date().toISOString(),
    endAt: endAt || startAt || new Date().toISOString(),
    creatorUserId,
    creatorUsername,
    maxAttendees,
    attendeeIds: [],
    createdAt: new Date().toISOString(),
  };
}
