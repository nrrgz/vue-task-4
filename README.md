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

## Design decisions & tradeoffs

**Permissions come from the backend.** The login response carries `permissions[]` alongside the
user, and the frontend never maps a role to permissions itself. The role→permission table lives
only in `src/mocks/db.ts`, which stands in for the server. Adding a permission to a role is a
backend change; the UI picks it up with no edit.

**Session hydration is synchronous, then revalidated.** `main.ts` calls `authStore.hydrate()` — a
plain `localStorage` read — after Pinia is installed but before `app.use(router)` and
`app.mount()`. The store is therefore populated before the router's first navigation, so a refresh
on a protected route is not bounced to `/login`.

A single `GET /me` then revalidates that cached session, fired **after** `router.isReady()` and
`mount()`. Running it there keeps the guard synchronous — no awaiting an in-flight request, no
guard running against an empty store — while still catching a token the server no longer accepts
and re-syncing the cached user with the backend. Without it, editing your own account leaves a
stale name in the header after a reload, because the mock database re-seeds and `localStorage` does
not. A transport failure keeps the cached session; a 401 logs out via the response interceptor.

**Roles gate routes; permissions gate actions.** `meta: { roles: ['admin'] }` decides which pages
exist for you and is enforced in one `beforeEach`. `v-can="'delete_user'"` decides which controls
render. The two never mix — no role check inside a button, no permission check in a guard. Role is
coarse and stable, permission is fine-grained, and a role gaining a permission should not require
touching a route.

**`v-can` has two caveats, both deliberate.**

1. _It is cosmetic._ The directive only hides a control. Real authorization is the backend
   returning 403, caught by the response interceptor, which surfaces a toast. Hiding the delete
   button removes the temptation, not the capability — the API rejects the call regardless. Because
   it runs in `mounted`, a denied element also exists for one frame before it is replaced by a
   comment anchor.
2. _It is not reactive._ Directives do not re-run when reactive state changes, so permissions
   gained or lost after mount are not reflected until the element remounts. This is fine here
   because permissions only change at login/logout, which remounts the tree anyway.

**The URL is the single source of truth for table state.** Page, size, sort, order, search and role
filter live in `route.query`; UI actions push a new query and a watcher fetches from it. No
component keeps a parallel copy, so a pasted URL restores the exact table. Search uses `replace`
and a 350 ms debounce to avoid flooding history.

**Base components were reused unmodified.** `src/components/base/` is byte-identical to Task 3.
`BaseTable` needed a controlled-sorting mode for server-side sort; rather than patch the copy here,
it was fixed at the source in Task 3 and re-copied, so this project's components are genuinely
unedited. `src/components/base` is in `.prettierignore` for the same reason.

**Known tradeoffs.** Mock data is in-memory, so edits and deletes reset on reload; the seed is
deterministic. Deleting the account you are signed in as is rejected with a 409, since otherwise
the token stops resolving to a user and the next request logs you out mid-session. The mock token is base64, not stored server-side, so it still resolves after the
service worker restarts — otherwise every refresh would log you out.
`public/mockServiceWorker.js` is generated (`npx msw init public/ --save`) but committed, since a
fresh clone has no mock backend without it.

## Definition of done

- [x] Admin login → every page reachable, delete buttons visible
- [x] Regular user → typing `/users` manually → redirected to `/403`; no delete buttons anywhere
- [x] Logged out → open `/dashboard` → sent to `/login` → after login, returned to `/dashboard`
- [x] F5 refresh keeps the session
- [x] Clicking a table column header fires the correct request (visible in the Network tab)
- [x] No console warnings or errors anywhere
- [x] `vue-tsc --noEmit` passes; `eslint .` passes
- [x] README documents run steps, decisions, and known tradeoffs

## Structure

```
src/
  api/           axios client + typed endpoints
  components/    base/ (reused, unchanged), form/, layout/, feedback/
  composables/   useServerTable (URL <-> query <-> fetch)
  directives/    can.ts (v-can)
  router/        routes + guards
  stores/        auth, notifications, preferences
  views/         login, dashboard, users, user edit, settings, 403, 404
  mocks/         MSW handlers + seed data
```
