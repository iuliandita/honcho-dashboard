# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.3] - 2026-04-29

### Fixed

- Reduced health-check and static-asset log noise, disabled ANSI color escapes
  for non-TTY logs, and added startup build metadata for container runs.
- Documented runtime config workspace picker behavior when no workspace is
  preselected.
- Kept the dependency refresh compatible with current TypeScript, Vitest,
  Biome, and Svelte test environments.

### Changed

- Updated Bun dependency group and release image references.

## [1.6.2] - 2026-04-29

### Fixed

- Settings chrome now stays aligned with the main content width on large
  displays, and the dashboard title links back home.
- The local `bun run dev` command now starts both the Hono BFF and Vite so
  `/api/runtime-config` does not fail on a frontend-only dev server.

### Changed

- The settings menu now uses compact icon and segmented controls for theme,
  font size, and language selection.

## [1.6.1] - 2026-04-29

### Changed

- Plain Kubernetes manifests now default to the published GHCR image
  repository and `1.6.1` release image tag instead of a `REPLACE_ME`
  `latest` placeholder.
- Plain Kubernetes and Helm deployment docs now call out that image tags omit
  the leading `v` used by Git release tags.
- Plain Kubernetes docs now cover external TLS termination behind a reverse
  proxy and production-style password auth with
  `DASHBOARD_AUTH_PASSWORD_HASH`.

### Added

- Plain Kubernetes default-deny `NetworkPolicy` example for ingress-nginx,
  Honcho API egress, and kube-dns egress.

## [1.6.0] - 2026-04-29

### Added

- Built-in single-operator dashboard password gate. When
  `DASHBOARD_AUTH_MODE=password` is set, the dashboard shell and proxied
  Honcho API routes require an HTTP-only, SameSite session cookie while
  `/healthz` remains public.
- Dialectic chat panel with SSE streaming against `/peers/{id}/chat`.
  Cancel mid-stream, reset between sends, surface mid-stream interruptions
  as typed errors, and invalidate the peer query on clean close so
  representation/profile reflect post-chat shifts. Routes added in both
  pinned and picker modes; the existing peer chrome already linked here.
- Opt-in Prometheus `ServiceMonitor` for both plain Kubernetes
  (`deploy/k8s/servicemonitor.yaml`, excluded from kustomization base by
  default) and Helm (`templates/servicemonitor.yaml`, gated on
  `metrics.serviceMonitorScaffold.enabled`). This is scaffolding for
  Prometheus Operator discovery; the dashboard does not expose `/metrics` yet.
- CI security gates for gitleaks, semgrep, Trivy filesystem scans, and release
  image scans.

### Fixed

- Corrected the 1.0.0 entry: dialectic chat was documented there too early
  and actually landed after 1.0.0.
- Runtime version now comes from `package.json`, with
  `HONCHO_DASHBOARD_VERSION` available for release overrides.
- Runtime env parsing now fails fast for invalid Honcho API URLs, timeouts,
  ports, and production build directories.
- Dynamic app and Honcho API path segments are encoded consistently for
  workspace, peer, and session IDs.
- CSP no longer allows inline scripts.
- Helm ingress now defaults to disabled so unauthenticated public exposure is
  harder to create accidentally.
- Tracked `docs/local` scratch files were removed from git.

### Changed

- GitHub Actions now pin Bun to the Dockerfile runtime version and avoid
  floating `latest` tool downloads.
- README testing docs call out Vitest/Playwright package scripts instead of
  Bun's native `bun test`.

## [1.0.0] - 2026-04-28

First public release.

### Added

- Workspace / peer / session three-pane drill-down in pinned and picker modes.
- Read-only message stream with cursor pagination.
- Per-peer representation viewer with topic filtering.
- Per-peer profile tab with sanitized markdown rendering.
- Workspace-scoped semantic search with debounced input and topic facets.
- `/style-guide` route with a live design system showcase.
- Multi-stage Dockerfile using `oven/bun:1-alpine`.
- `docker-compose.yml` example with a full Honcho stack.
- Plain Kubernetes manifests under `deploy/k8s/`.
- Helm chart under `deploy/helm/honcho-dashboard/` with values schema.
- GitHub Actions CI for lint, tests, build, e2e, Helm, and Kubernetes consistency.
- Tag-driven release workflow publishing images to GHCR with SBOM.

### Configuration

The dashboard configures entirely at runtime via env:

- `HONCHO_API_BASE` - required.
- `HONCHO_ADMIN_TOKEN` - required and never leaves the dashboard process.
- `HONCHO_WORKSPACE_ID` - optional; pins to a single workspace.

See [README](./README.md) for the full env reference.
