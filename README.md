# ReachConvert Frontend

Next.js dashboard for **ReachConvert** — an outreach platform that unifies
personalized bulk email, autonomous AI voice calling, and signal-based automation in
one workspace for exploring job opportunities and driving conversions.

**Live app:** [www.reachconvert.site](https://www.reachconvert.site) · [Docs](https://www.reachconvert.site/documentation) · Vercel URL: [agentreach-frontend-rho.vercel.app](https://agentreach-frontend-rho.vercel.app)  
This app is the operator UI. It talks to the [ReachConvert backend](../AgentReach-backend)
over REST (`NEXT_PUBLIC_API_URL`) and ships a full in-app **Documentation portal** at
`/documentation` with two explicit tracks:

- User Documentation (operator workflows, setup, launch, monitor, troubleshooting)
- Technical Documentation (architecture, data flow, module boundaries, APIs)

---

## System documentation

Contributor-facing docs for the full workspace live one level up in [`../docs`](../docs):

- [Full architecture](../docs/ARCHITECTURE.md)
- [Feature documentation index](../docs/FEATURES.md)
- [Contacts](../docs/features/contacts.md)
- [Prospect Finder](../docs/features/prospect-finder.md)
- [Contact Finder (Hunter.io)](../docs/features/contact-finder.md)
- [Scout, the outreach assistant](../docs/features/scout.md)
- [Email campaigns and templates](../docs/features/email-campaigns-and-templates.md)
- [AI calling and realtime voice](../docs/features/ai-calling-and-realtime-voice.md)
- [AI calling bots and RAG](../docs/features/ai-calling-bots-and-rag.md)
- [Signals and playbooks](../docs/features/signals-and-playbooks.md)
- [Campaign scheduler](../docs/features/scheduler.md)

The in-app `/documentation` portal includes both user and technical tracks.
The markdown files in `../docs` remain the contributor-facing technical source of truth.

---

## Tech stack

| Concern       | Choice                                                       |
| ------------- | ------------------------------------------------------------ |
| Framework     | [Next.js 16](https://nextjs.org) (App Router, RSC)           |
| Runtime       | React 19                                                     |
| Language      | TypeScript 5                                                 |
| Styling       | Tailwind CSS v4 (`@tailwindcss/postcss`)                     |
| Server state  | [TanStack Query v5](https://tanstack.com/query)              |
| Client state  | [Zustand](https://zustand-demo.pmnd.rs) (`useOutreachStore`) |
| Charts        | [Recharts](https://recharts.org)                             |
| Icons         | `lucide-react`                                               |
| Bundler (dev) | Webpack (`next dev --webpack`)                               |

---

## Application structure

The App Router lives in [`src/app`](src/app). Authenticated product screens are
grouped under the `(dashboard)` route group behind a shared layout; the marketing
login and public documentation sit outside it.

```
src/
├── app/
│   ├── (dashboard)/            # authenticated app (shared layout + AppShell)
│   │   ├── dashboard/          # cross-channel overview
│   │   ├── signals/            # signal feed + review queue
│   │   │   └── playbooks/      # automation playbooks
│   │   ├── contacts/           # contacts + directories
│   │   ├── prospects/          # Prospect Finder: ICP search wizard, run loop, results
│   │   ├── contact-finder/     # Contact Finder: Hunter.io people and email lookup
│   │   ├── email-campaigns/    # Email campaigns: templates, preview, launch, relaunch
│   │   ├── ai-calling-bots/    # Calling Agents: personas + RAG knowledge bases
│   │   ├── calling-campaigns/  # AI calling: voice calling campaigns
│   │   ├── history/            # email + call history
│   │   ├── settings/           # SES / Twilio / Gemini / Hunter.io credentials
│   │   └── profile/            # profile, theme, accent colour, password
│   ├── (site)/prospect-finder/ # public marketing page for Prospect Finder
│   ├── documentation/          # in-app docs portal (index + [slug] pages)
│   ├── login/                  # login + password reset
│   ├── layout.tsx              # root layout
│   └── providers.tsx           # React Query + global providers
├── components/                 # AppShell, Sidebar, AuthGuard, Alert, Loader, fx…
│   └── assistant/              # Scout: floating launcher, chat, result cards, Markdown
├── lib/
│   ├── api.ts                  # typed fetch client (auth, refresh, all endpoints)
│   ├── localAuth.ts            # token/session persistence
│   ├── docs.ts                 # documentation content model (DOC_PAGES)
│   └── utils.ts
└── store/
    └── useOutreachStore.ts     # Zustand global store
```

---

## Screens

| Route                | Purpose                                                                            |
| -------------------- | ---------------------------------------------------------------------------------- |
| `/login`             | Sign in and password reset. |
| `/dashboard`         | Cross-channel overview and live metrics. |
| `/signals`           | Signal feed (funding, hiring, news, bounces) and human review queue. |
| `/signals/playbooks` | Rules that turn signals into automatic outreach. |
| `/contacts`          | Recruiter, company, hiring-team, and lead contacts + directories; CSV/XLSX import. |
| `/prospects`         | **Prospect Finder** — describe an ideal customer (or list companies), run a resumable search, review scored companies and verified people, and add them to Contacts. Needs a Gemini key. |
| `/ai-command-center` | **Scout** full view — the outreach assistant, also opened from the floating button in the bottom-right corner of every dashboard page. Needs a Gemini key. |
| `/contact-finder`    | **Contact Finder** — search a company's people through Hunter.io, find or verify a single email, and save results to Contacts. Needs a Hunter.io key; every lookup spends Hunter credits. |
| `/email-campaigns`   | **Email Campaigns** — build/generate templates, preview, launch, and relaunch bulk email. |
| `/ai-calling-bots`   | **Calling Agents** — create agent personas with a PDF-backed RAG knowledge base. |
| `/calling-campaigns` | **AI Calling** — configure and run AI voice calling campaigns with live outcomes. |
| `/scheduler`         | View and cancel future email/calling launches. |
| `/history`           | Filterable email and call history, including replies. |
| `/settings`          | Connect AWS SES, Twilio, Gemini, and Hunter.io; test each connection. |
| `/profile`           | User profile, theme, accent colours, and password update. |
| `/documentation`     | In-app documentation portal (see below). |

---

## Scout, the outreach assistant

<img src="public/scout-logo.svg" alt="Scout logo" width="72" height="72" />

**Scout** is the AI assistant inside the dashboard. A round button in the
bottom-right corner of every dashboard page opens it as a panel, and
`/ai-command-center` shows the full view with conversation history. Scout finds
contacts (Contact Finder) and hiring companies (Prospect Finder), reads Signals,
the inbox and metrics, and drafts email or calling campaigns that launch only
after the user confirms the preview.

| Piece | File |
| --- | --- |
| Floating button and panel | [`src/components/assistant/AssistantLauncher.tsx`](src/components/assistant/AssistantLauncher.tsx) |
| Conversation UI (page and panel) | [`src/components/assistant/AssistantChat.tsx`](src/components/assistant/AssistantChat.tsx) |
| Result cards (contacts, prospects, campaigns, Signals) | [`src/components/assistant/AssistantCards.tsx`](src/components/assistant/AssistantCards.tsx) |
| Markdown answers | [`src/components/assistant/AssistantMarkdown.tsx`](src/components/assistant/AssistantMarkdown.tsx) |
| Logo component / static logo | [`src/components/assistant/ScoutLogo.tsx`](src/components/assistant/ScoutLogo.tsx), [`public/scout-logo.svg`](public/scout-logo.svg) |
| Public product page | [`src/app/(site)/scout/page.tsx`](src/app/(site)/scout/page.tsx) (`/scout`) |

The backend side is `src/ai-chat` in the backend repo; see
[Scout architecture](../docs/features/scout.md).

---

## Data & auth flow

- [`src/lib/api.ts`](src/lib/api.ts) is a single typed client wrapping `fetch`. It
  sends requests with `credentials: include`; the backend keeps access and refresh
  tokens in `HttpOnly` cookies, and the client sends a separate CSRF header for
  state-changing requests. Sessions are **transparently refreshed** on `401` via
  `/auth/refresh`, with request timeouts (8s default, 45s for AI calls) and friendly
  error mapping. Every backend resource has a typed method here
  (`api.auth`, `api.contacts`, `api.prospects`, `api.contactFinder`,
  `api.emailCampaigns`, `api.signals`, `api.aiCallingBots`, `api.callingCampaigns`,
  `api.history`, `api.analytics`, `api.settings`).
- [`src/lib/localAuth.ts`](src/lib/localAuth.ts) persists only the non-sensitive user
  profile and preferences; it does not store authentication tokens.
- Google SSO goes through an AWS Cognito user pool. [`src/lib/cognitoAuth.ts`](src/lib/cognitoAuth.ts)
  sends the browser to Google via Cognito (authorization code grant with PKCE) and
  [`/auth/callback`](src/app/auth/callback/page.tsx) exchanges the code for an ID
  token. The backend verifies that token against the user pool before issuing the
  same HttpOnly session cookies as password login.
- [`src/components/AuthGuard.tsx`](src/components/AuthGuard.tsx) gates the dashboard
  group and redirects unauthenticated users to `/login`.
- Server state is cached with **TanStack Query** (configured in
  [`src/app/providers.tsx`](src/app/providers.tsx)); cross-cutting UI state lives in
  the Zustand [`useOutreachStore`](src/store/useOutreachStore.ts).

---

## Documentation portal

A first-class, in-app docs site lives under [`src/app/documentation`](src/app/documentation).
Content is authored as **data** (not JSX) in
[`src/lib/docs.ts`](src/lib/docs.ts) — an array of `DocPage` objects grouped by
track (`User Documentation`, `Technical Documentation`) and category.
Each page is rendered uniformly by `documentation/[slug]/page.tsx` with a shared
sidebar (`DocSidebar.tsx`).

The overview page includes client-side search and filters for track/category. Individual
pages support breadcrumbs, prerequisite checklists, section anchors, a sticky table of
contents, copyable examples, callouts, related pages, and previous/next navigation.
Richer page metadata such as `audience`, `prerequisites`, and `lastReviewed` belongs on
the `DocPage`; reusable section callouts belong on `DocSection`.

Technical pages include rendered Mermaid diagrams for system topology, REST/auth flow,
NestJS module boundaries, MongoDB relationships, provider boundaries, and feature-level
architecture flows.

To add or edit docs, update the `DOC_PAGES` array in `src/lib/docs.ts`. Diagram sections
use the `diagram` field and render through `src/components/MermaidDiagram.tsx`.

---

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A running [ReachConvert backend](../AgentReach-backend) (default `http://localhost:3001`)

### Install & run

```bash
cd AgentReach-frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:3000
```

### Environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_COGNITO_DOMAIN=reachconvert-auth.auth.ap-south-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=2s32tm07mrvhfugpa5gl35uana
```

| Variable              | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API. Defaults to `http://localhost:3001/api` when unset. |
| `NEXT_PUBLIC_COGNITO_DOMAIN`, `NEXT_PUBLIC_COGNITO_CLIENT_ID` | The Cognito user pool's sign-in domain (no `https://`) and app client ID for Google sign-in. Browser configuration, not secrets. |

### Google SSO setup

Google sign-in uses the `reachconvert-users` Cognito user pool in `ap-south-1`
with Google as its identity provider. The pool, app client and domain are set up
already; [`deploy/cognito-google-sso.sh`](https://github.com/OutReachAgent/AgentReach-backend/blob/main/deploy/cognito-google-sso.sh)
in the backend repo connects the Google OAuth client. The Google OAuth client
needs `https://reachconvert-auth.auth.ap-south-1.amazoncognito.com/oauth2/idpresponse`
as an authorized redirect URI, and each site origin's `/auth/callback` must be an
allowed callback URL on the Cognito app client.

### Scripts

```bash
npm run dev      # start dev server (Webpack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

---

## Key files

```text
src/app/providers.tsx                       # React Query provider
src/app/(dashboard)/layout.tsx              # authenticated shell layout
src/app/(dashboard)/email-campaigns/page.tsx
src/app/(dashboard)/calling-campaigns/page.tsx
src/app/(dashboard)/signals/page.tsx
src/app/(dashboard)/prospects/page.tsx      # Prospect Finder UI and run loop
src/app/(dashboard)/contact-finder/page.tsx # Contact Finder UI
src/components/assistant/AssistantLauncher.tsx # floating Scout button and panel
src/components/assistant/AssistantChat.tsx  # Scout conversation UI (page and panel)
src/app/documentation/[slug]/page.tsx       # renders DocPage content
src/components/AuthGuard.tsx
src/components/AppShell.tsx
src/components/Sidebar.tsx
src/lib/api.ts                              # typed API client
src/lib/localAuth.ts                        # token/session storage
src/lib/docs.ts                             # documentation content
src/store/useOutreachStore.ts              # global client state
```

---

## Contributing & license

Contributions are welcome — see the in-app [`/contribute`](src/app/(site)/contribute/page.tsx)
page for local setup and the pull request workflow, or reach out via
[`/contact`](src/app/(site)/contact/page.tsx).

ReachConvert is licensed under the [GNU Affero General Public License v3.0](LICENSE).
