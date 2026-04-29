# honcho-dashboard

Self-hosted web dashboard for the OSS [Honcho](https://github.com/plastic-labs/honcho) server.

> Honcho ships an API-only OSS server. The first-party dashboard ("Honcho Chat") is closed-source and
> cloud-only. This repo provides a self-hostable inspector for operators running their own Honcho deployment.

![Honcho Dashboard representation view with sample data](./docs/assets/honcho-dashboard-representation.png)

The dashboard is an admin-facing inspection UI for Honcho's workspace, peer, session, representation, profile,
chat, and search APIs. It runs a small server-side proxy so the Honcho admin token stays on the server and never
lands in browser storage.

## Status

v1 is usable for self-hosted Honcho inspection. The dashboard is admin-facing and expects a trusted operator
network. It is mostly read-only: session messages, representation, profile, peers, workspaces, and search are
inspection surfaces. The chat tab sends natural-language queries to Honcho's dialectic endpoint and can cause
Honcho to derive updated peer context, but the dashboard does not edit or delete Honcho memories.

## Features

- Workspace picker mode, plus optional pinned-workspace mode via `HONCHO_WORKSPACE_ID`.
- Peer and session browser for drilling into Honcho's `workspace -> peer -> session -> message` hierarchy.
- Read-only message stream with older-page pagination.
- Per-peer representation view with topic chips and markdown-derived cards.
- Per-peer profile view with sanitized markdown rendering.
- Dialectic chat panel over Honcho's streaming `/peers/{peer_id}/chat` endpoint.
- Workspace semantic search with debounced query input and topic filtering.
- Docker image, Docker Compose example, plain Kubernetes manifests, and Helm chart.

## Quickstart

```bash
docker run --rm -p 3000:3000 \
  -e HONCHO_API_BASE=https://your-honcho.example.com \
  -e HONCHO_ADMIN_TOKEN=your-admin-token \
  ghcr.io/iuliandita/honcho-dashboard:latest
```

Open <http://localhost:3000>.

## Develop locally

```bash
bun install
bun run codegen
bun run dev
```

Set `HONCHO_API_BASE` and `HONCHO_ADMIN_TOKEN` in `.env` or your shell before starting the app.

## Configuration

| Env var | Required | Description |
|---|---|---|
| `HONCHO_API_BASE` | yes | Base URL of the Honcho API (e.g. `https://honcho.example.com`) |
| `HONCHO_ADMIN_TOKEN` | yes | Admin bearer token; never leaves the dashboard process |
| `HONCHO_WORKSPACE_ID` | no | If set, pins the dashboard to a single workspace |
| `PORT` | no | Listen port. Default `3000`. |
| `LOG_LEVEL` | no | `info` (default) or `debug`; `silent` is for tests |
| `HONCHO_PROXY_TIMEOUT` | no | Upstream timeout in seconds. Default `15`. |
| `BUILD_DIR` | no | Advanced override for the static build directory. Default `./build`. |

`docker-compose.yml` also requires `POSTGRES_PASSWORD` for its bundled Honcho/Postgres example.

## Deploy

- Plain Kubernetes manifests: [`deploy/k8s/`](./deploy/k8s/)
- Helm chart: [`deploy/helm/honcho-dashboard/`](./deploy/helm/honcho-dashboard/)

## License

MIT. See [LICENSE](./LICENSE).
