# Triply

Triply is an AI-powered social travel platform that helps travelers discover companions, plan trips collaboratively, and travel safely.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT (httpOnly cookies), bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/travel_buddy"
JWT_SECRET="your-secret-key-min-32-chars"
```

### 3. Database setup

```bash
npm run db:push
npm run seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

After seeding, you can log in with:

| Email | Password |
|-------|----------|
| jane@example.com | password123 |
| sarah@example.com | password123 |
| james@example.com | password123 |
| emma@example.com | password123 |

## Features

- **Auth**: Email/password signup, login, JWT, protected routes
- **Profile**: View and edit profile, preferences
- **Matches**: Compatibility scoring, discovery, save profiles
- **Trips**: Create, list, join trips
- **Chat**: Conversations, messages (API ready)
- **Safety**: Report users, verified badges

## Project Structure

```
├── app/
│   ├── (auth)/          # Login, signup, onboarding
│   ├── (dashboard)/     # Dashboard, matches, profile, chat, create, explore
│   ├── api/             # API routes
│   └── layout.tsx
├── components/
├── lib/                 # Prisma, auth, validations
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── data/                # Mock data for static UI
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run db:push` - Push schema to DB
- `npm run db:migrate` - Run migrations
- `npm run seed` - Seed demo data
