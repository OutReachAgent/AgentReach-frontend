# ReachConvert Frontend

A production-ready Next.js application built with TypeScript, Tailwind CSS, and strict code quality standards.

## 🚀 Features

- **Next.js (App Router)**: Modern routing and server components.
- **TypeScript**: Strict type checking configured for enterprise development.
- **Tailwind CSS**: Rapid, modern styling.
- **ESLint**: Custom code quality rules enforced.
- **Absolute Imports**: Absolute imports configured with `@/*` mapping.
- **Environment Support**: Centralized configuration and validation.

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have **Node.js 18+** and **npm** (or your preferred package manager) installed.

### Setup

1. Clone the repository and navigate to the folder:
   ```bash
   cd AgentReach-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the environment file:
   ```bash
   cp .env.example .env
   ```
   Define your environment variables inside the `.env` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

---

## 💻 Available Scripts

In the project directory, you can run:

### `npm run dev`
Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run build`
Builds the application for production to the `.next` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run start`
Starts the application in production mode.
Run this after `npm run build` to launch the production server.

### `npm run lint`
Runs ESLint to check for syntax and style issues.
Strict linting is enforced with zero errors.

---

## 📁 Project Structure

```text
src/
├── app/              # App router (pages, layouts, API routes)
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── utils/            # Helper functions and utilities
└── types/            # TypeScript interfaces and type definitions
```
