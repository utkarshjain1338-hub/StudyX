# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Routing**: Wouter
- **UI library**: Radix UI + shadcn/ui components

## Artifacts

### Study Tracker (`artifacts/study-tracker`)
A personal study habit tracker web app.

**Features:**
- Dashboard with daily streak (flame icon, glows when active today)
- Per-task individual streak tracking with flame badges
- Mark tasks as complete/incomplete for today
- Weekly 7-day activity grid
- Full task CRUD (create, edit, delete)
- Color-coded tasks by category
- Study history page with heatmap and per-task streaks

**Pages:**
- `/` — Dashboard (daily streak, today's tasks, weekly history)
- `/tasks` — All tasks management
- `/history` — Study history and analytics

### API Server (`artifacts/api-server`)
Express API server serving all study tracker data.

**Routes:**
- `GET/POST /api/tasks` — list and create tasks
- `GET/PUT/DELETE /api/tasks/:id` — single task operations
- `GET/POST /api/completions` — list and mark completions
- `DELETE /api/completions/:id` — unmark completion
- `GET /api/streaks/daily` — overall daily streak
- `GET /api/streaks/tasks` — per-task streak info
- `GET /api/dashboard/summary` — dashboard aggregate stats
- `GET /api/history/weekly` — last 7 days history

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
