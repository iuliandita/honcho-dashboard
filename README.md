# honcho-dashboard

Self-hosted web inspector for the OSS [Honcho](https://github.com/plastic-labs/honcho) server.

> Honcho ships an API-only OSS server. The first-party dashboard ("Honcho Chat") is closed-source and
> cloud-only. This repo provides a self-hostable inspector for any Honcho deployment.

## Status

Pre-release. v1 is in active development.

## Quickstart

```bash
docker run --rm -p 3000:3000 \
  -e HONCHO_API_BASE=https://your-honcho.example.com \
  -e HONCHO_ADMIN_TOKEN=your-admin-token \
  ghcr.io/<handle>/honcho-dashboard:latest
```

Open <http://localhost:3000>.

## Configuration

| Env var | Required | Description |
|---|---|---|
| `HONCHO_API_BASE` | yes | Base URL of the Honcho API (e.g. `https://honcho.example.com`) |
| `HONCHO_ADMIN_TOKEN` | yes | Admin bearer token; never leaves the dashboard process |
| `HONCHO_WORKSPACE_ID` | no | If set, pins the dashboard to a single workspace |
| `PORT` | no | Listen port. Default `3000`. |
| `LOG_LEVEL` | no | `info` (default) \| `debug` |
| `HONCHO_PROXY_TIMEOUT` | no | Upstream timeout in seconds. Default `15`. |

## License

MIT. See [LICENSE](./LICENSE).
