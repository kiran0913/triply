# Production QA Checklist – Travel Buddy Finder

## AUTH

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| A1 | Sign up with email + password | Account created; redirect to dashboard or verify-email | High |
| A2 | Login with valid credentials | Redirect to dashboard; session cookie set | High |
| A3 | Logout | Session cleared; redirect to home/login | High |
| A4 | Refresh page while logged in | Session persists; user stays logged in | High |
| A5 | Visit protected route while logged out | Redirect to login | High |
| A6 | Use expired session | Redirect to login; no crash | Medium |

---

## PROFILES

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| P1 | Complete onboarding flow | Profile created; can access dashboard | High |
| P2 | Edit profile (bio, location, etc.) | Changes saved and visible | High |
| P3 | Add profile photo (URL) | Photo displays on profile | High |
| P4 | View public profile | Correct data; no 404 | High |
| P5 | Save profile | Saved; appears in saved list | Medium |
| P6 | Report profile | Report recorded; admin can see | Medium |
| P7 | Message from profile | Opens chat or creates conversation | Medium |

---

## MATCHES

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| M1 | Open Discover | List of profiles loads | High |
| M2 | Apply filters | Results update correctly | High |
| M3 | Save a match | Saved; visible in saved list | Medium |
| M4 | Connect / navigate to profile | Profile page loads | High |
| M5 | Check AI score display | Score shown (or fallback if no AI key) | Medium |

---

## CHAT

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| C1 | Open conversation list | Conversations load | High |
| C2 | Open chat from profile “Message” button | Conversation created or opened | High |
| C3 | Send message | Message appears; recipient can see | High |
| C4 | New message notification | Unread count / notification appears | Medium |

---

## TRIPS

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| T1 | Create trip | Trip created; visible in list | High |
| T2 | Explore trips | Trip list loads | High |
| T3 | View trip detail | Details load; join/leave visible | High |
| T4 | Join trip | Membership created; host sees | High |
| T5 | Leave trip | Membership removed | Medium |
| T6 | Save AI trip planner output | Trip created or saved | Medium |
| T7 | Use trip recommendations | Recommendations load | Low |

---

## REVIEWS

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| R1 | Leave review on profile | Review saved; shows on profile | High |
| R2 | View reviews on profile | Reviews display | High |
| R3 | Try to leave duplicate review | Prevented or handled gracefully | Medium |

---

## NOTIFICATIONS

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| N1 | Check unread count | Correct count | Medium |
| N2 | Open notification list | List loads | Medium |
| N3 | Mark as read | Count updates | Medium |
| N4 | Message / trip notifications | Appear in list | Medium |

---

## SAFETY / VERIFICATION

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| S1 | Open Verification Center | Page loads; options visible | Medium |
| S2 | Open Safety Center | Page loads | Medium |
| S3 | View risky profile/trip | Handled per app logic | Low |
| S4 | Report / flag content | Visible to admin | Medium |

---

## ADMIN

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| Ad1 | Access /admin as non-admin | 403 or redirect | High |
| Ad2 | Access /admin as admin | Dashboard loads | High |
| Ad3 | View flagged users list | List loads | Medium |
| Ad4 | Open user review page | Page loads; actions work | Medium |
| Ad5 | Update user status | Status persists | Medium |

---

## ERROR / EDGE CASES

| # | What to do | Expected result | Priority |
|---|------------|-----------------|----------|
| E1 | Visit invalid route (e.g. /profile/invalid-id) | 404 or sensible error; no crash | High |
| E2 | Access protected API without auth | 401 | High |
| E3 | Deploy without required env vars | App fails gracefully or build fails | High |
| E4 | Disable AI (remove key) | App works with fallback (rules-based) | Medium |
| E5 | Empty states (no matches, no trips) | Friendly message; no errors | Medium |
| E6 | Simulate network failure | Error message; no infinite loading | Medium |
