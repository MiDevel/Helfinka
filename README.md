# Helfinka

A health diary application for tracking personal health events and summaries.

## Features

- Track health events and symptoms
- View event summaries and statistics
- Responsive design for all devices
- Dark/light theme support
- Toast notifications with custom icons
- Modern UI with Tailwind CSS and shadcn/ui components
- Client-side routing with React Router
- TypeScript type safety
- Vite build system
- ESLint for code quality

## Getting Started

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Run a production build: `npm run build`
- Preview production build: `npm run preview`
- Lint the codebase: `npm run lint`

## Project Structure

- `src/main.tsx` – application entry, providers (Router, React Query, Toaster).
- `src/App.tsx` – route tree for the SPA.
- `src/components/layout/AppLayout.tsx` – shared app shell (header, nav, main).
- `src/routes/` – page-level route components.
- `src/components/ui/` – shadcn/ui components.
- `src/lib/` – utilities, helpers, and future API clients.
- `AGENTS.md` – detailed tech stack and guidelines for AI agents and developers.

## Development Workflow

- **Add a new page**
  - Create `src/routes/YourPageName.tsx`.
  - Register it in `src/App.tsx` with a new `<Route>`.
  - Optionally add navigation in `AppLayout`.
- **Add a new UI component from shadcn/ui**
  - Run `npx shadcn@latest add <component>` from the project root.

## Deployment Notes

- Helfinka is deployed under a subfolder of a larger site, not at the domain root.
- Use React Router navigation and relative asset imports instead of hardcoded `/...` URLs.
- The router `basename` is derived from `import.meta.env.BASE_URL` so paths follow the configured Vite `base`.
