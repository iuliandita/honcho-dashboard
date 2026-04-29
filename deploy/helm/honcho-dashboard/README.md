# honcho-dashboard Helm chart

Self-hosted Honcho inspector. Renders the same Deployment / Service / Ingress / ConfigMap shape as
`deploy/k8s/` plain manifests, with values driven by `values.yaml`.

## Install

```bash
kubectl create secret generic honcho-dashboard-secret \
  --from-literal=HONCHO_ADMIN_TOKEN="$HONCHO_ADMIN_TOKEN" \
  --from-literal=DASHBOARD_AUTH_PASSWORD_HASH="$DASHBOARD_AUTH_PASSWORD_HASH" \
  --from-literal=DASHBOARD_SESSION_SECRET="$DASHBOARD_SESSION_SECRET"

helm install dashboard ./deploy/helm/honcho-dashboard \
  --set honcho.apiBase=https://honcho.example.com \
  --set secret.create=false \
  --set secret.existingSecretName=honcho-dashboard-secret \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=dashboard.example.com
```

If you want the chart to create the Secret, pass sensitive values from files instead of `--set` so they do not
appear in process argv:

```bash
printf '%s' "$HONCHO_ADMIN_TOKEN" > /tmp/honcho-admin-token
printf '%s' "$DASHBOARD_AUTH_PASSWORD_HASH" > /tmp/honcho-dashboard-password-hash
helm install dashboard ./deploy/helm/honcho-dashboard \
  --set honcho.apiBase=https://honcho.example.com \
  --set-file secret.adminToken=/tmp/honcho-admin-token \
  --set dashboardAuth.mode=password \
  --set dashboardAuth.sessionSecret="$DASHBOARD_SESSION_SECRET" \
  --set-file dashboardAuth.passwordHash=/tmp/honcho-dashboard-password-hash \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=dashboard.example.com
rm /tmp/honcho-admin-token /tmp/honcho-dashboard-password-hash
```

Enable shared-password auth by setting `dashboardAuth.mode=password` and providing
`dashboardAuth.sessionSecret` plus either `dashboardAuth.passwordHash` (preferred) or
`dashboardAuth.password`:

```bash
helm install dashboard ./deploy/helm/honcho-dashboard \
  --set honcho.apiBase=https://honcho.example.com \
  --set-file secret.adminToken=/tmp/honcho-admin-token \
  --set dashboardAuth.mode=password \
  --set dashboardAuth.sessionSecret="$DASHBOARD_SESSION_SECRET" \
  --set-file dashboardAuth.passwordHash=/tmp/honcho-dashboard-password-hash
```

The dashboard is an admin-token BFF. Keep it on a trusted operator network. Shared-password auth protects the
dashboard shell and proxied Honcho API requests, but it is intentionally not a multi-user or role-based system.
`ingress.enabled` defaults to `false`; enable ingress only after setting shared-password auth or equivalent
reverse-proxy authentication. `/healthz` stays public for probes.

Release image tags omit the leading `v`: set `image.tag=1.6.1` for Git tag `v1.6.1`. Leaving `image.tag`
empty uses `.Chart.AppVersion`, which also omits the leading `v`.

The default ingress values assume ingress-nginx and cert-manager-managed TLS. If TLS is terminated by an
external reverse proxy instead, remove the cert-manager annotation and set `ingress.tls=[]`, or leave
`ingress.enabled=false` and route the external proxy to the chart's ClusterIP Service.

## Values reference

See [`values.yaml`](./values.yaml) for documented defaults and [`values.schema.json`](./values.schema.json)
for validation.

| Key | Default | Description |
|---|---|---|
| `image.repository` | `ghcr.io/iuliandita/honcho-dashboard` | Container image |
| `image.tag` | `""` (= `.Chart.AppVersion`) | Image tag |
| `honcho.apiBase` | `https://REPLACE_ME-honcho.example.com` | Honcho API base URL (required) |
| `honcho.workspaceId` | `""` | Pin dashboard to one workspace; empty = picker mode |
| `honcho.proxyTimeout` | `15` | Upstream timeout (seconds) |
| `dashboardAuth.mode` | `off` | `off` or `password` |
| `dashboardAuth.password` | `""` | Plaintext shared password for simple installs |
| `dashboardAuth.passwordHash` | `""` | Preferred password hash for production-like installs |
| `dashboardAuth.sessionSecret` | `""` | Required when password auth is enabled |
| `dashboardAuth.sessionTtlSeconds` | `43200` | Signed session cookie lifetime |
| `secret.create` | `true` | Create the admin-token secret in-chart |
| `secret.adminToken` | `""` | Admin token (required when `create=true`) |
| `secret.existingSecretName` | `""` | Reference an external secret instead |
| `ingress.enabled` | `false` | Provision ingress; enable only with dashboard or reverse-proxy auth |
| `metrics.serviceMonitorScaffold.enabled` | `false` | Render scaffold-only ServiceMonitor |
| `metrics.serviceMonitorScaffold.path` | `/metrics` | Future scrape path; scaffold only until metrics exist |
| `metrics.serviceMonitorScaffold.interval` | `30s` | ServiceMonitor scrape interval |
| `metrics.serviceMonitorScaffold.scrapeTimeout` | `10s` | ServiceMonitor scrape timeout |
| `metrics.serviceMonitorScaffold.additionalLabels` | `{}` | Extra labels such as `release: kube-prometheus-stack` |
| `replicaCount` | `1` | Pod replicas |
