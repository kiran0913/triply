# Collaborative Itinerary – Testing Steps

## Prerequisites

1. Run migration: `npm run db:migrate` or `npx prisma migrate dev --name add_itinerary`
2. Ensure you have at least one trip where you are a **member** (create trip + join, or join an existing trip).

---

## 1. Schema & API

### Schema

- **ItineraryItem** – dayNumber, title, description, costEstimate, startTime, endTime, position, addedById, completedAt
- **ItineraryItemVote** – userId, itemId (unique per user per item)
- **ItineraryItemComment** – itemId, userId, content

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/trips/[id]/itinerary` | List itinerary items (members only) |
| POST | `/api/trips/[id]/itinerary` | Add item |
| PATCH | `/api/trips/[id]/itinerary/[itemId]` | Update item or toggle complete |
| DELETE | `/api/trips/[id]/itinerary/[itemId]` | Delete item |
| POST | `/api/trips/[id]/itinerary/[itemId]/vote` | Toggle vote |
| GET | `/api/trips/[id]/itinerary/[itemId]/comments` | List comments |
| POST | `/api/trips/[id]/itinerary/[itemId]/comments` | Add comment |

---

## 2. Test Cases

### A. Add itinerary item

1. Open a trip where you are a member.
2. Scroll to **Shared itinerary**.
3. Click **Add activity**.
4. Fill: Day 1, Title "Visit Kyoto temples", Cost estimate "$20", Start 09:00, End 12:00.
5. Click **Add activity**.
6. **Expected:** New item appears in Day 1.

### B. Vote on activity

1. On an itinerary item, click the thumbs-up icon.
2. **Expected:** Vote count increases; icon is highlighted.
3. Click again.
4. **Expected:** Vote count decreases; icon returns to normal.

### C. Comment on activity

1. Click the comment icon on an item.
2. Type a comment and click **Send**.
3. **Expected:** Comment appears below with your name and timestamp.

### D. Mark activity complete

1. Click the checkmark icon on an item.
2. **Expected:** Item shows strikethrough and "Completed" badge; background changes.
3. Click again.
4. **Expected:** Item returns to normal.

### E. Non-member access

1. Log in as a user who is **not** a member of the trip.
2. Visit the trip page.
3. **Expected:** Shared itinerary section is not visible.

### F. Unauthenticated

1. Log out and visit `/api/trips/[id]/itinerary` directly.
2. **Expected:** 401 Unauthorized.

---

## 3. Manual API Checks

```bash
# List itinerary (requires auth cookie)
curl -b cookies.txt https://localhost:3000/api/trips/TRIP_ID/itinerary

# Add item
curl -X POST -b cookies.txt -H "Content-Type: application/json" \
  -d '{"dayNumber":1,"title":"Visit Kyoto","costEstimate":"$20"}' \
  https://localhost:3000/api/trips/TRIP_ID/itinerary

# Vote
curl -X POST -b cookies.txt \
  https://localhost:3000/api/trips/TRIP_ID/itinerary/ITEM_ID/vote

# Add comment
curl -X POST -b cookies.txt -H "Content-Type: application/json" \
  -d '{"content":"Sounds great!"}' \
  https://localhost:3000/api/trips/TRIP_ID/itinerary/ITEM_ID/comments

# Toggle complete
curl -X PATCH -b cookies.txt -H "Content-Type: application/json" \
  -d '{"completed":true}' \
  https://localhost:3000/api/trips/TRIP_ID/itinerary/ITEM_ID
```

---

## 4. Regression

- [ ] Trip detail page loads for non-members (no itinerary).
- [ ] Join/leave trip still works.
- [ ] Chat from member list still works.
- [ ] AI trip planner still works (unchanged).
