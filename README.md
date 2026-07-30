# Mini Admin Panel

A small admin panel with authentication, role- and permission-based access, a server-side
data table, and config-driven dynamic forms. Built with Vue 3, TypeScript, Pinia, Vue Router,
axios, and MSW for a mock backend.

## Run

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`.

## Test accounts

| Role  | Email             | Password | Can                                    |
|-------|-------------------|----------|----------------------------------------|
| Admin | admin@example.com | admin    | View/edit/delete users, view settings  |
| User  | user@example.com  | user     | View settings only                     |

*(These are seeded in `src/mocks/db.ts`.)*

## What it does

- **Auth** — mock login returns a token + user; the session survives a page refresh.
- **Route protection** — unauthenticated users are sent to `/login`; users without the required
  role hit `/403`.
- **Role- vs permission-based UI** — routes are gated by role; individual controls by the `v-can`
  directive.
- **Server-side table** — sorting, filtering, search, and pagination happen on the backend, with
  the table state reflected in the URL (shareable and refresh-safe).
- **Dynamic forms** — form fields are generated from a JSON config via `<component :is>`.

## Design decisions & tradeoffs

- **Permissions come from the backend.** The login response includes the user's `permissions[]`;
  the frontend never hardcodes a role→permission map. This keeps authorization logic in one place.
- **Roles gate routes, permissions gate actions.** Two distinct concepts: `meta.roles` protects
  pages, `v-can` protects controls.
- **Synchronous session hydration.** The auth store is restored from `localStorage` before the
  router's first navigation, so a valid session isn't bounced to `/login` on refresh. Chosen over
  revalidating via `GET /me` on boot to avoid an async route guard; the `/me` approach is the more
  production-realistic alternative.
- **`v-can` is cosmetic, not security.** It removes controls the user can't use, but real
  authorization is enforced by the backend returning 403 (handled by the axios interceptor).
  It also does not react to role changes at runtime.
- **Tokens live only in the axios interceptor and the auth store** — never in components.

## Structure

```
src/
  api/          axios client + interceptors, typed endpoints
  components/    base/ (reused, unchanged), form/, layout/, feedback/
  composables/   useServerTable (URL <-> query <-> fetch)
  directives/    can.ts (v-can)
  router/        routes + guards
  stores/        auth, notifications
  views/         login, dashboard, users, user edit, settings, 403, 404
  mocks/         MSW handlers + seed data
```
