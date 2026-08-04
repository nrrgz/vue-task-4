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

That boot call swallows its own rejection on purpose — revalidation is best-effort, so a failed
`GET /me` shows nothing and the session simply continues from the persisted data. It also captures
the token before awaiting and discards the response if the token changed meanwhile, so logging out
(or signing in as someone else) mid-request cannot resurrect the previous user or re-persist them.

**Roles gate routes; permissions gate actions.** `meta: { roles: ['admin'] }` decides which pages
exist for you and is enforced in one `beforeEach`. `v-can="'delete_user'"` decides which controls
render. The two never mix — no role check inside a button, no permission check in a guard. Role is
coarse and stable, permission is fine-grained, and a role gaining a permission should not require
touching a route.

The guard needs no redirect-loop protection of its own: `/login` and `/403` carry no `meta`, so
neither the `requiresAuth` check nor the role check can match them and redirect them to themselves.
The route table is what makes the loop unreachable.

**The interceptor owns the session; each caller owns its error display.** The axios interceptor has
exactly two global jobs, and generic error reporting is not one of them. The request half attaches
`Authorization: Bearer …`. The response half turns a 401 on anything other than the login call into
a logout, a redirect to `/login?redirect=…`, and one session-expired toast. Every other failure —
403, 404, 409, 500, a dead network — rejects untouched, because only the caller knows whether the
right surface is a toast, an inline panel with a Retry button, or nothing at all. The users table
and the edit form's initial load render failures inline; a failed delete or save raises a toast; the
boot revalidation stays silent. A failed login is reported by `LoginView`, which is why the 401
branch excludes the login request rather than logging you out of a session you never had.

That split leaves one seam. On a 401 the interceptor has already reported, so a caller that toasted
as well would show two messages for one failure. The interceptor therefore tags the rejected error
via `markErrorReported`, and the callers that toast check `isReportedError` and skip. Inline error
state is still set — the table can show its error panel alongside the session-expired toast, which
is one message plus one piece of page state, not two messages.

**`v-can` has two caveats, both deliberate.**

1. _It is cosmetic._ The directive only hides a control. Real authorization is the backend
   returning 403, which the calling view catches and reports. Hiding the delete button removes the
   temptation, not the capability — the API rejects the call regardless. Because
   it runs in `mounted`, a denied element also exists for one frame before it is replaced by a
   comment anchor.
2. _It is not reactive._ The directive is evaluated on mount and never re-runs when permissions
   change afterwards. No stale control actually survives here: the only in-app permission change is
   an admin demoting themselves through the edit form, and the role change that comes with it makes
   `watchAccess` re-evaluate access and navigate them off the route, which remounts. The one window
   this design leaves open is a permission change that does not also alter the role — which no flow
   in this app can produce.

**The URL is the single source of truth for table state.** Page, size, sort, order, search and role
filter live in `route.query`; UI actions push a new query and a watcher fetches from it. No
component keeps a parallel copy, so a pasted URL restores the exact table. Search uses `replace`
and a 350 ms debounce to avoid flooding history.

**Base components were reused unmodified.** `src/components/base/` is byte-identical to Task 3.
`BaseTable` needed a controlled-sorting mode for server-side sort; rather than patch the copy here,
it was fixed at the source in Task 3 and re-copied, so this project's components are genuinely
unedited. `src/components/base` is in `.prettierignore` for the same reason.

**Known tradeoffs.** Mock data is in-memory, so edits and deletes reset on reload; the seed is
deterministic. Deleting the account you are signed in as is rejected with a 409, but the UI already
disables that button, so the check is backend defence-in-depth rather than a flow you can reach —
without it the token would stop resolving to a user and the next request would log you out
mid-session. The mock token is base64, not stored server-side, so it still resolves after the
service worker restarts — otherwise every refresh would log you out.
`public/mockServiceWorker.js` is generated (`npx msw init public/ --save`) but committed, since a
fresh clone has no mock backend without it.

## Scope & known limitations

- **The mock token never expires and there is no refresh-token flow.** Sessions end only on
  logout, or when a request returns 401 — which the response interceptor turns into a logout and a
  redirect to `/login` with the current path as `redirect`. Real expiry, refresh rotation and
  server-side revocation are out of scope.
- **Boot revalidation fails silently by design.** Its caller chooses to display nothing, so a
  transport or server failure surfaces no message and the session continues from the persisted
  data. Only a 401 ends it, logging you out with a session-expired toast from the interceptor.
- **`active` is stored but not enforced.** An account marked inactive can still sign in; the flag
  exists to exercise the dynamic form's checkbox field type.

## Definition of done

The criteria this project is built against. The last two are enforced by `npm run typecheck` and
`npm run lint`; the rest are runtime checks to walk through against `npm run dev` with the browser
console and Network tab open.

- Admin login → every page reachable, delete buttons visible
- Regular user → typing `/users` manually → redirected to `/403`; no delete buttons anywhere
- Logged out → open `/dashboard` → sent to `/login` → after login, returned to `/dashboard`
- F5 refresh keeps the session
- Clicking a table column header fires the correct request (visible in the Network tab)
- No console warnings or errors anywhere
- `vue-tsc --noEmit` passes; `eslint .` passes
- README documents run steps, decisions, and known tradeoffs

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
