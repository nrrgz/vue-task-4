# Mini Admin Panel

Admin panel with auth, role- and permission-based access, a server-side data table, and
config-driven dynamic forms. Vue 3 + TypeScript, Pinia, Vue Router, axios, MSW.

## Run

```bash
npm install
npm run dev
```

Other scripts: `build`, `lint`, `typecheck`, `format`.

No backend needed — MSW intercepts requests in the browser.

## Test accounts

| Role  | Email             | Password | Can                                   |
| ----- | ----------------- | -------- | ------------------------------------- |
| Admin | admin@example.com | admin    | View/edit/delete users, view settings |
| User  | user@example.com  | user     | View settings only                    |

The other 48 seeded users share the password `password123`.

## Decisions & tradeoffs

- **Permissions come from the backend.** The login response carries `permissions[]`; the frontend
  never maps role to permissions itself.
- **Roles gate routes, permissions gate actions.** `meta.roles` protects pages, `v-can` protects
  controls.
- **Synchronous session hydration.** The auth store is restored from `localStorage` before the
  router's first navigation, so a refresh isn't bounced to `/login`. Revalidating via `GET /me` on
  boot would be more production-realistic but needs an async guard.
- **`v-can` is cosmetic.** Real authorization is the backend returning 403, caught by the response
  interceptor — hiding a control only removes the temptation. Two caveats: it runs in `mounted`, so
  a denied element exists for one frame before it is replaced by a comment anchor; and directives
  don't re-run on reactive change, so permissions gained or lost after mount need a remount.
- **Tokens live only in the axios interceptor and the auth store**, never in components.
- **Mock data is in-memory**, so edits and deletes reset on reload. The seed is deterministic.
- **The mock token is base64, not stored server-side**, so it still resolves after the worker
  restarts — otherwise every refresh would log you out.
- **`public/mockServiceWorker.js` is generated but committed** (`npx msw init public/ --save`).
  Without it a fresh clone has no mock backend.

## Structure

```
src/
  api/           axios client + typed endpoints
  components/    base/ (reused, unchanged), form/, layout/, feedback/
  composables/   useServerTable (URL <-> query <-> fetch)
  directives/    can.ts (v-can)
  router/        routes + guards
  stores/        auth, notifications
  views/         login, dashboard, users, user edit, settings, 403, 404
  mocks/         MSW handlers + seed data
```
