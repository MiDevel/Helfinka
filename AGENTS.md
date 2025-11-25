# Helfinka AGENTS Guide

This document is primarily for AI coding assistants working on the Helfinka frontend, but it should also be useful for human developers.

---

## Purpose and Context

Helfinka is a client-side health diary application. The frontend is a React SPA that talks to a separate backend (AWS API Gateway + JWT-based auth).

Key constraints:

- **SPA only** – no SSR.
- **Deployed under a subfolder** of another site, not at the root domain.
- **Type-safe** and **component-driven** UI using Tailwind and shadcn/ui.

---

## Tech Stack Overview

- **Framework / runtime**
  - React 19
  - Vite 7 (React + TypeScript template)
  - TypeScript (strict settings)

- **Styling and design system**
  - Tailwind CSS v4 via `@tailwindcss/vite`
  - `tw-animate-css` for animations
  - shadcn/ui
    - Style: `new-york`
    - Base color: `slate`
  - Icon library: `lucide-react`

- **Routing and data**
  - React Router (`BrowserRouter`, `Routes`, `Route`)
  - TanStack React Query for server state and caching
  - Axios for HTTP (and/or fetch wrappers as needed)
  - Zod for schema validation

- **Notifications**
  - Sonner, via `@/components/ui/sonner`

- **Tooling**
  - ESLint (flat config)
  - **No Prettier** (do not assume or add it unless explicitly requested)

---

## Project Layout

Relevant files and directories:

- `src/main.tsx`
  - App entrypoint.
  - Sets up `BrowserRouter`, `QueryClientProvider`, and the global `Toaster`.

- `src/App.tsx`
  - Declares the route tree using React Router.
  - Wraps all routes with `AppLayout`.

- `src/components/layout/AppLayout.tsx`
  - Application shell: header, navigation, main content container.
  - Shared layout for all routes.

- `src/routes/`
  - `DashboardPage.tsx` – Today overview.
  - `EventsListPage.tsx` – List/filter of health events.
  - `EventCreatePage.tsx` – New event form (to be implemented).
  - `SummaryPage.tsx` – Summaries and statistics (to be implemented).
  - `AuthLoginPage.tsx` – Login view to connect to AWS JWT backend.

- `src/components/ui/`
  - shadcn/ui components (e.g., `button`, `input`, `textarea`, `card`, `tabs`, `dropdown-menu`, `dialog`, `skeleton`, `sonner`).

- `src/lib/utils.ts`
  - `cn` helper (Tailwind + clsx + tailwind-merge).

- `components.json`
  - shadcn/ui configuration (aliases, Tailwind CSS entry, style, base color, etc.).

- `vite.config.ts`
  - Uses `@tailwindcss/vite` plugin.
  - Defines alias `@` → `/src`.

- `tsconfig.json`, `tsconfig.app.json`
  - Configure TypeScript with `baseUrl` and path alias `"@/*": ["./src/*"]`.

---

## Guidelines for AI Agents

### 1. Imports and paths

- Prefer `@/` imports over long relative paths.
  - ✅ `import AppLayout from '@/components/layout/AppLayout'`
  - ❌ `import AppLayout from '../../../components/layout/AppLayout'`
- Keep new shared code under:
  - `src/components/` for reusable UI.
  - `src/routes/` for page-level components.
  - `src/lib/` for utilities, API clients, and hooks.
  - `src/types/` (to be created) for domain models.

### 2. Routing and navigation

- All routing is handled via React Router in `App.tsx`.
- When adding a new page:
  1. Create a component in `src/routes/YourPageName.tsx`.
  2. Add a `<Route>` in `App.tsx`.
  3. Optionally add links or buttons in `AppLayout`.
- Use React Router navigation (`<Link>`, `<NavLink>`, or hooks) instead of manually manipulating `window.location` for internal links.

### 3. Tailwind, shadcn/ui, and styling

- Use shadcn/ui components from `src/components/ui` when available.
- Compose layouts with Tailwind CSS utility classes.
- `src/index.css` is managed by Tailwind v4 and shadcn; it uses advanced at-rules such as `@custom-variant`, `@theme`, and `@apply`. These are expected and may appear as unknown to generic CSS linters.
- Do not remove or rewrite the theme tokens or Tailwind at-rules in `src/index.css` unless you understand the implications for shadcn/ui.

### 4. Data fetching and backend integration

- Use TanStack React Query for any backend data once APIs are wired:
  - Create API client helpers in `src/lib/api/*`.
  - Expose hooks that internally use React Query.
- Keep authentication logic in a focused area, e.g.:
  - `src/lib/auth/*` for token storage and helpers.
  - Hooks like `useAuth` can live in `src/lib` or `src/hooks` once that folder is created.
- Validate server responses with Zod where practical, especially for auth and event data.

### 5. Subfolder deployment assumptions

This app is **not** guaranteed to live at the domain root (`/`). It may be served from a subpath, e.g. `/apps/helfinka/`.

- **Do not** hardcode root-based paths such as `/some-route` for internal navigation or assets.
- Use React Router and relative links instead:
  - ✅ `<Link to="/events">` (Router will respect `basename`)
- When dealing with asset paths or redirects, use Vite and Router facilities:
  - Prefer relative imports for assets (e.g. `import logo from '@/assets/logo.svg'`).
  - When you must construct URLs, consider `import.meta.env.BASE_URL` and/or the `basename` configured on `BrowserRouter`.
- Avoid logic that assumes `window.location.pathname` starts with `/` only for this app.

### 6. Tooling constraints

- ESLint is configured; run `npm run lint` to check.
- **Do not add Prettier** or change linting/tooling stacks unless explicitly requested.
- Keep TypeScript strictness intact; prefer fixing type issues rather than loosening compiler options.

---

## Future Extensions

When extending Helfinka, prefer these patterns:

- Model health events and summaries with dedicated TypeScript types and Zod schemas.
- Keep event-related logic grouped:
  - UI in `src/routes` and `src/components/events/*`.
  - API calls in `src/lib/api/events.ts`.
  - Types in `src/types/event.ts`.
- Follow the same pattern for authentication, user profile, and analytics.
