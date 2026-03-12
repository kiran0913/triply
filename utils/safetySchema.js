// Safety check-in: user sets a timer when meeting someone; if not checked in, emergency contact is alerted
export const createSafetyCheckIn = ({
  userId,
  meetUserId,
  meetUsername,
  postId = null,
  postTitle = null,
  dueAt, // ISO string when check-in is required by
  emergencyContactName,
  emergencyContactPhone,
  checkedInAt = null,
  emergencyContactNotifiedAt = null,
}) => ({
  userId,
  meetUserId,
  meetUsername,
  postId,
  postTitle,
  dueAt,
  emergencyContactName,
  emergencyContactPhone,
  checkedInAt,
  emergencyContactNotifiedAt,
  createdAt: new Date().toISOString(),
  status: "active", // active | checked_in | overdue (client/cloud can set overdue)
});
