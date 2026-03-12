# Travel Buddy Finder – Architecture

## Mermaid Diagram

```mermaid
graph TD
    subgraph Frontend["Frontend (Next.js)"]
        Dashboard["Dashboard"]
        Matches["Matches"]
        Chat["Chat"]
        TripPlanner["Trip Planner"]
        Admin["Admin"]
    end

    subgraph API["API Routes"]
        Auth["/api/auth/*"]
        Trips["/api/trips/*"]
        MatchesAPI["/api/matches"]
        Conversations["/api/conversations/*"]
        Notifications["/api/notifications/*"]
        Reviews["/api/reviews"]
        Reports["/api/reports"]
    end

    subgraph AI["AI API Routes"]
        TripPlan["/api/ai/trip-plan"]
        RecommendTrips["/api/ai/recommend-trips"]
        Assistant["/api/ai/assistant"]
        ReScore["/api/ai/re-score-matches"]
    end

    subgraph AI_Layer["AI Layer (100% Local)"]
        LocalAI["lib/ai-local.ts"]
        AIService["lib/ai-service.ts"]
        AICache["AICache (DB)"]
        Ollama["Ollama (localhost:11434)"]
    end

    subgraph Safety["Safety Layer"]
        Fraud["Fraud Detection"]
        SafetyScoring["Safety Scoring"]
        Moderation["Content Moderation"]
    end

    subgraph Admin_Tools["Admin Tools"]
        Flagged["Flagged Users"]
        ReportsAdmin["Reports"]
        FraudEvents["Fraud Events"]
    end

    subgraph Data["Database"]
        Prisma["Prisma ORM"]
        Supabase["Supabase Postgres"]
    end

    Dashboard --> Auth
    Matches --> MatchesAPI
    Chat --> Conversations
    TripPlanner --> TripPlan
    Admin --> Flagged
    Admin --> ReportsAdmin
    Admin --> FraudEvents

    TripPlan --> AIService
    RecommendTrips --> AIService
    Assistant --> AIService
    ReScore --> AIService

    AIService --> AICache
    AIService --> LocalAI
    LocalAI --> Ollama
    AICache --> Prisma

    MatchesAPI --> Prisma
    Trips --> Prisma
    Conversations --> Prisma
    Notifications --> Prisma
    Reviews --> Prisma
    Reports --> Prisma

    Auth --> Prisma
    Safety --> LocalAI
    Prisma --> Supabase
```

---

## Component Summary

| Component | Description |
|-----------|-------------|
| **Frontend** | Next.js 14 App Router, dashboard, matches, chat, trip planner, admin |
| **API** | Auth, trips, matches, conversations, notifications, reviews, reports |
| **AI Routes** | trip-plan, recommend-trips, assistant, re-score-matches |
| **AI Layer** | `lib/ai-local.ts` → Ollama; `lib/ai-service.ts` → cache + prompts |
| **AICache** | Prisma `AICache` table; cache keys like `trip-plan:dest:dates` |
| **Database** | Supabase Postgres, Prisma ORM |
| **Safety** | Rule-based + AI (Ollama) for profiles, messages, trips |
| **Admin** | Flagged users, reports, fraud events |
