# Travel Stories – Feature Overview

## How Stories Improve Retention

1. **Post-trip engagement** – Users return after a trip to share, keeping them active.
2. **Social proof** – Stories show real experiences, encouraging others to join future trips.
3. **Discovery** – Stories surface destinations and travelers; users find new trips and buddies.
4. **Content loop** – Likes and comments drive repeat visits.
5. **Story → trip link** – Stories link to trips, guiding users back to the core product.

---

## Schema

**TravelStory**
- id, tripId, authorId, title, content
- photos (Json – string[] of image URLs)
- highlights (Json – string[] e.g. ["Best ramen", "Favorite temple"])
- createdAt

**StoryLike**
- id, storyId, userId
- @@unique([storyId, userId])

**StoryComment**
- id, storyId, userId, content, createdAt

---

## Files Created / Modified

### Created
- `app/api/stories/route.ts` – GET feed, POST create
- `app/api/stories/[id]/route.ts` – GET story details
- `app/api/stories/[id]/like/route.ts` – POST toggle like
- `app/api/stories/[id]/comment/route.ts` – POST add comment
- `app/(dashboard)/stories/page.tsx` – Story feed
- `app/(dashboard)/stories/[id]/page.tsx` – Story detail + comments
- `components/stories/StoryCard.tsx`
- `components/stories/CreateStoryForm.tsx`
- `TRAVEL_STORIES.md` – this file

### Modified
- `prisma/schema.prisma` – TravelStory, StoryLike, StoryComment
- `lib/validations.ts` – createStorySchema, storyCommentSchema
- `app/(dashboard)/trips/[id]/page.tsx` – CreateStoryForm for completed trips
- `components/DashboardLayout.tsx` – Stories nav link

---

## API

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | /api/stories | Optional | Feed (filter: tripId, authorId) |
| POST | /api/stories | Required | Create story (completed trip members only) |
| GET | /api/stories/[id] | Optional | Story details + comments |
| POST | /api/stories/[id]/like | Required | Toggle like |
| POST | /api/stories/[id]/comment | Required | Add comment |

---

## Testing

1. **Create story**
   - Join a trip whose end date has passed (or status CLOSED)
   - Open trip page → "Share your story"
   - Fill title, content, optional photo URLs and highlights → Publish

2. **Story feed**
   - Visit /stories → see story cards with author, destination, photos, likes/comments

3. **Engagement**
   - Click story → view detail
   - Like (requires login)
   - Add comment (requires login)
   - Click "View trip" → trip page

4. **Discovery**
   - Story links to trip (public /t/slug or /trips/id)
   - Story cards show author → profile link
