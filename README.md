# honcho-dashboard

Self-hosted web inspector for the OSS [Honcho](https://github.com/plastic-labs/honcho) server.

> Honcho ships an API-only OSS server. The first-party dashboard ("Honcho Chat") is closed-source and
> cloud-only. This repo provides a self-hostable inspector for any Honcho deployment.

## Status

v1 is usable for self-hosted Honcho inspection. The dashboard is admin-facing and expects a trusted operator
network.

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
