# honcho-dashboard v1.5.0 Operator Comfort Design

## Purpose

`v1.5.0` is an Operator Comfort release. It keeps `honcho-dashboard` focused on self-hosted Honcho
inspection, while making the dashboard safer and more comfortable for real LAN/VPN deployments.

The release adds:

- Optional dashboard auth for private self-hosted installs.
- Font scale presets for large and high-resolution displays.
- Complete English and German localization, with a structure that makes future languages straightforward.

The release does not add multi-user accounts, Honcho memory editing, OIDC, role-based access control, or
server-persisted user preferences.

## Recommended Scope

### Must Have

- Optional shared-password dashboard auth with an HTTP-only session cookie.
- Auth disabled unless explicitly enabled by configuration.
- Public `/healthz` for probes.
- Public static app shell and assets so the client-side login screen can render.
- No browser-stored Honcho admin token and no forwarding of browser `Authorization` headers.
- Font scale setting: `small`, `normal`, `large`, `extra large`.
- Full English and German UI catalogs.
- Language selection on the login screen and inside the running app.
- Browser/system theme detection on first visit:
  - Use light theme when the browser preference is light.
  - Use dark theme when the browser preference is dark.
  - Default to dark when no preference can be detected.
  - Once the user explicitly selects a theme, persist it and prefer it over browser detection.
- Browser/system locale detection on first visit:
  - Use German when the browser preference is German.
  - Use English when the browser preference is English.
  - Default to English for any unsupported language.
  - Once the user explicitly selects a language, persist it and prefer it over browser detection.
- Correct document `lang` handling for the active locale.
- Deployment docs for auth, font scale, and language behavior.

### Should Have

- A compact settings entry point in the existing top chrome.
- Settings controls grouped together: theme, font scale, language, and logout when auth is enabled.
- Helm, plain Kubernetes, Docker, and README configuration updates.
- Unit, server, accessibility, and Playwright coverage for auth, font scaling, and German UI flows.
- A missing-translation check so new UI strings cannot silently ship in only one locale.

### Later

- OIDC.
- Reverse-proxy trusted-header auth.
- Named users, roles, and audit trails.
- Server-persisted preferences.
- Density presets beyond font scaling.
- Additional languages based on actual user requests.

## UX Design

### Auth

Auth should feel like a thin access gate rather than a full account system. When auth is disabled, the app
loads exactly as it does today. When auth is enabled, unauthenticated users see a simple password screen using
the existing terminal visual language. After successful login, users return to the originally requested path.

The login screen includes:

- Password input.
- Submit button.
- Language selector visible before login.
- Non-revealing error copy for failed login.

The top chrome includes a logout action only when auth is enabled.

### Font Scale

Font scale is a global display preference, not a density system. The options are:

- `small`
- `normal`
- `large`
- `extra large`

`normal` matches the current v1 typography. The setting is persisted locally and applied to the root element
so all app surfaces use the same scale: browser lists, message streams, representation cards, profile
markdown, search results, and chat.

The design should preserve the dense terminal feel. Spacing and layout should not become a separate
preference in `v1.5.0`.

### Theme

Theme remains a user-facing preference with `dark` and `light` options. On first visit, before any explicit
user choice exists, the dashboard should respect the browser/system color-scheme preference. If the browser
prefers light, start in light mode. If the browser prefers dark, start in dark mode. If no preference can be
detected, start in dark mode.

Once the user changes theme manually, persist that choice locally and prefer it over browser detection. For
example, if the system is light but the user chooses dark, the dashboard stays dark until the user changes it
again.

### Localization

English and German are complete first-class UI languages. German is not a placeholder and must use proper
German characters, including `Ä`, `Ö`, `Ü`, `ä`, `ö`, `ü`, and `ß` where appropriate.

The language selector is available:

- On the login screen when auth is enabled.
- In the app settings control while the dashboard is running.

Initial language selection follows browser/system language when no explicit user choice exists. Explicit user
choice is persisted locally and wins over future browser detection. For example, if the browser is English but
the user selects German, the dashboard stays German until the user changes it.

Translate app UI only. Do not translate user-provided or Honcho-provided content such as peer IDs, workspace
IDs, message bodies, profile markdown, representation conclusions, search result content, or chat responses.

German labels should be clear and product-appropriate. Examples:

- Workspaces: `Arbeitsbereiche`
- Sessions: `Sitzungen`
- Representation: `Darstellung`
- Profile: `Profil`
- Search: `Suche`
- Logout: `Abmelden`

## Technical Design

### Auth Architecture

Auth belongs in the Hono BFF. It should protect the Honcho proxy and authenticated dashboard APIs, while
keeping `/healthz`, auth endpoints, and the static app shell public. The app shell must remain public because
the login screen is rendered by the client-side Svelte app.

Recommended configuration:

- `DASHBOARD_AUTH_MODE=off|password`
- `DASHBOARD_AUTH_PASSWORD_HASH` preferred for password mode.
- `DASHBOARD_AUTH_PASSWORD` allowed for local/simple deployments, with documentation warning that a hash is
  preferable.
- `DASHBOARD_SESSION_SECRET` required when password auth is enabled.
- `DASHBOARD_SESSION_TTL_SECONDS` optional, with a conservative default.

Recommended routes:

- `GET /api/auth/status` returns whether auth is enabled and whether the current browser session is
  authenticated.
- `POST /api/auth/login` accepts the shared password and sets the session cookie on success.
- `POST /api/auth/logout` clears the session cookie.
- `GET /api/runtime-config` may stay public, but in auth-enabled mode it must expose only non-sensitive
  bootstrap configuration needed to render login and initialize client settings.

The session cookie should be HTTP-only, same-site, path-scoped to the app, and secure when served over HTTPS.
The app should avoid ever exposing the configured Honcho admin token to the browser.

Because the dashboard proxies state-changing Honcho calls such as chat, auth middleware should reject
unauthenticated `/api/v3/*` requests before they reach the proxy. CSRF should be considered in the auth
design: same-site cookies reduce cross-site risk, and login/logout/proxy requests should avoid permissive
CORS.

### Settings Architecture

Create a small client settings module that owns:

- Theme.
- Font scale.
- Locale.

Theme should move out of `+layout.svelte` into this module, or the new settings module should wrap the
existing theme behavior. The important outcome is that settings have one consistent persistence and
initialization path, including browser theme detection before an explicit stored preference exists.

Persistence remains browser-local for `v1.5.0`.

### Font Scale Implementation

Apply a `data-font-scale` attribute to the root element. CSS overrides should adjust the existing `--text-*`
tokens rather than replacing component-level font sizes. This keeps the implementation aligned with the
current token system.

`normal` should preserve current token values. Larger scales must be checked against:

- Top chrome.
- Peer tabs.
- Message bubbles.
- Representation cards.
- Profile markdown.
- Search input and result cards.
- Chat input and streamed response.
- Mobile viewport behavior.

### i18n Implementation

Add a small message catalog system with English and German catalogs. The implementation should make adding a
new language mechanical:

- Add a catalog file.
- Add locale metadata.
- Add the locale to the selector.
- Run the missing-key check.

Catalog keys should be stable and grouped by feature or surface. Avoid string concatenation that breaks German
word order. Prefer full-sentence messages where grammar may differ between languages.

Set `document.documentElement.lang` whenever the active locale changes. If date or number formatting is
touched, use the active locale rather than hardcoded English assumptions.

## Testing

### Unit Tests

- Locale detection chooses German for German browser preferences.
- Locale detection chooses English for English browser preferences.
- Unsupported browser languages default to English.
- Explicit stored locale wins over browser detection.
- Theme detection chooses light for light browser preferences.
- Theme detection chooses dark for dark browser preferences or unknown preference.
- Explicit stored theme wins over browser detection.
- Font scale persistence and validation.
- Missing catalog keys fail tests.
- Auth config validation requires the right secrets for password mode.

### Server Tests

- `/healthz` remains public.
- Auth-disabled mode preserves current app behavior.
- Auth-enabled mode still serves the static app shell and assets for the login screen.
- Auth-enabled mode blocks proxied Honcho API requests for unauthenticated sessions.
- Login succeeds with the configured password and sets a session cookie.
- Login fails without revealing whether the password exists or which part failed.
- Logout clears the session.
- Proxy continues injecting only the server-side Honcho admin token.

### Playwright And Accessibility Tests

- Login flow in English.
- Login flow in German.
- Language selector works before login.
- Language selector works while logged in.
- Browser locale initializes German when no saved preference exists.
- Saved German preference persists even when browser language is English.
- Font scale options apply visibly without breaking key desktop and mobile layouts.
- Axe checks cover the login page and representative authenticated routes.

## Risks

- Auth middleware can accidentally block health checks, static assets, or login bootstrap data if route
  ordering is too broad.
- Shared-password auth is not a team identity system; document it as a LAN/VPN access gate.
- Cookie auth needs conservative same-site behavior because the dashboard can trigger Honcho chat POSTs.
- German strings are longer than English and may stress tabs, buttons, and compact chrome.
- i18n migration touches many components and can create noisy diffs if key naming is inconsistent.
- `extra large` font scale may expose hidden layout assumptions in compact cards and mobile tabs.

## Open Questions

- Confirm the password hash format during implementation planning. Prefer a Bun-native password hashing API if
  it provides a standard verifiable hash string without adding a dependency.
- Use an app-specific session cookie name, for example `honcho_dashboard_session`, to avoid collisions behind
  shared domains.
- Keep `/api/runtime-config` public only for non-sensitive bootstrap fields. Move any future sensitive runtime
  fields behind an authenticated endpoint.
- Support both hash and plaintext password configuration for `v1.5.0`, with hash preferred in docs and
  plaintext framed as a local/simple-deployment convenience.

## Implementation Order

1. Add the client settings foundation for theme, font scale, and locale.
2. Add font scale root attributes and CSS token overrides.
3. Add i18n infrastructure and English/German catalogs.
4. Migrate visible UI copy to catalog lookups.
5. Add language selectors on login and in-app settings.
6. Add document `lang` updates and locale detection.
7. Add password auth config, routes, middleware, and session cookies in the Hono BFF.
8. Add the login screen and return-to-requested-route behavior.
9. Update Docker, Kubernetes, Helm, README, and deployment docs.
10. Add and run unit, server, accessibility, and Playwright coverage.
