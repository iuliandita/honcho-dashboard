# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-28

First public release.

### Added

- Workspace / peer / session three-pane drill-down in pinned and picker modes.
- Read-only message stream with cursor pagination.
- Per-peer representation viewer with topic filtering.
- Per-peer profile tab with sanitized markdown rendering.
- Dialectic chat panel with SSE streaming and peer-data invalidation after close.
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
