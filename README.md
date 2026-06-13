# ReachConvert Frontend

Next.js dashboard for ReachConvert, a bulk email and AI calling app for exploring job opportunities.

## Screens

- `/login`: login and password reset
- `/dashboard`: overview
- `/contacts`: recruiter, company, hiring team, and lead contacts
- `/email-campaigns`: bulk email templates, preview, launch, and relaunch
- `/calling-campaigns`: AI calling follow-ups
- `/history`: outreach history
- `/settings`: AWS SES and AI settings
- `/profile`: user profile, themes, accent colours, and password update

## Setup

```bash
cd AgentReach-frontend
npm install
cp .env.example .env
npm run dev
```

Environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Important Files

```text
src/app/login/page.tsx
src/app/(dashboard)/profile/page.tsx
src/app/(dashboard)/email-campaigns/page.tsx
src/components/AuthGuard.tsx
src/components/Sidebar.tsx
src/components/Alert.tsx
src/lib/api.ts
src/lib/localAuth.ts
```
