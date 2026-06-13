# ReachConvert Frontend

This is the Next.js dashboard for ReachConvert. It provides the user-facing screens for login, profile settings, contacts, templates, email campaigns, AI calling campaigns, history, analytics, and application settings.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Zustand
- Lucide React icons

## Main Screens

- `/login`: login and password reset UI
- `/dashboard`: outreach overview
- `/contacts`: contact management
- `/email-campaigns`: email template selection, preview, and campaign launch
- `/calling-campaigns`: AI calling campaign management
- `/history`: outreach history
- `/settings`: AWS SES and AI provider settings
- `/profile`: user profile, password update, themes, and accent colours

## Setup

```bash
cd AgentReach-frontend
npm install
cp .env.example .env
```

Update `.env` if your backend runs on a different URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`. If that port is busy, Next.js will show the alternate port in the terminal.

## Available Scripts

```bash
npm run dev
```

Starts the development server using webpack.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Runs the production build after `npm run build`.

```bash
npm run lint
```

Runs ESLint.

## Authentication

The frontend stores the current session in local storage:

- `reachconvert_access_token`
- `reachconvert_refresh_token`
- `reachconvert_user`

Protected dashboard pages use `AuthGuard`. If a session is missing or invalid, the user is sent back to `/login`.

## Theme System

Profile settings support 8 themes and 6 accent colours.

Dark themes:

- Midnight
- Slate
- Graphite
- Violet

Light themes:

- Cloud
- Paper
- Mint
- Rose

Accent colours:

- Indigo
- Emerald
- Sky
- Rose
- Amber
- Violet

Theme definitions live in `src/lib/localAuth.ts`. CSS variables and Tailwind class overrides live in `src/app/globals.css`.

## Important Files

```text
src/app/login/page.tsx                    # Login and password reset page
src/app/(dashboard)/profile/page.tsx      # Profile, themes, accent colours
src/app/(dashboard)/email-campaigns/page.tsx
src/components/AuthGuard.tsx              # Route protection
src/components/Sidebar.tsx                # Dashboard navigation
src/components/Alert.tsx                  # Toast/alert messages
src/lib/api.ts                            # Backend API client
src/lib/localAuth.ts                      # Local session and theme helpers
src/store/useOutreachStore.ts             # Shared UI state
```

## Production Notes

- Keep `NEXT_PUBLIC_API_URL` pointed at the deployed backend API.
- Run `npm run build` before deployment.
- Do not store secrets in frontend environment variables. Anything prefixed with `NEXT_PUBLIC_` is visible in the browser.
