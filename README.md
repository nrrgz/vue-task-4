# Mini Admin Panel

A small admin panel with authentication, role- and permission-based access, a server-side
data table, and config-driven dynamic forms. Built with Vue 3, TypeScript, Pinia, Vue Router,
axios, and MSW for a mock backend.

## Run

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`.

No backend is required — MSW intercepts requests in the browser.

## Test accounts

| Role  | Email             | Password | Can                                   |
| ----- | ----------------- | -------- | ------------------------------------- |
| Admin | admin@example.com | admin    | View/edit/delete users, view settings |
| User  | user@example.com  | user     | View settings only                    |

These two are the `TEST_ACCOUNTS` export in `src/mocks/db.ts`. The other 48 seeded users are
generated and all share the password `password123` (`GENERATED_ACCOUNT_PASSWORD`).

The role→permission map is defined in `src/mocks/db.ts` and is backend-side only — the frontend
reads `permissions[]` off the login response and never derives it from the role.

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
- **The mock token is decodable, not stored server-side.** It is `mock-jwt.` plus a base64 payload
  holding the user id, so the mock backend can resolve a token it never saw before. An in-memory
  token registry would be lost every time the worker restarts, which would break session-survives-
  refresh on the very first F5. It is obviously not a real signed JWT and verifies nothing.
- **Mock data is in-memory.** `PATCH` and `DELETE` mutate the seeded array, so edits and deletions
  reset on a full page reload. The seed itself is deterministic — same 50 users every boot.
- **The mock backend enforces permissions, not just `DELETE`.** `GET /users` requires `view_users`,
  `PATCH` requires `edit_user`, and `DELETE` requires `delete_user`; all of them 401 without a
  valid token. This is what makes `v-can` cosmetic rather than load-bearing.
- **The MSW worker script is generated but committed.** `public/mockServiceWorker.js` is produced
  by `npx msw init public/ --save`, not hand-written — do not edit it, and regenerate it with that
  command after upgrading `msw`. It is committed deliberately: MSW registers it as a real service
  worker, so without it in the repo a fresh clone has no mock backend and nothing in the app works.
  The tradeoff is a generated file in version control, which shows up as noise in `msw` upgrade
  diffs.

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
