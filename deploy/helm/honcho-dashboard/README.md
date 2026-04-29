# honcho-dashboard Helm chart

Self-hosted Honcho inspector. Renders the same Deployment / Service / Ingress / ConfigMap shape as
`deploy/k8s/` plain manifests, with values driven by `values.yaml`.

## Install

```bash
kubectl create secret generic honcho-dashboard-secret \
  --from-literal=HONCHO_ADMIN_TOKEN="$HONCHO_ADMIN_TOKEN"

helm install dashboard ./deploy/helm/honcho-dashboard \
  --set honcho.apiBase=https://honcho.example.com \
  --set secret.create=false \
  --set secret.existingSecretName=honcho-dashboard-secret \
  --set ingress.hosts[0].host=dashboard.example.com
```

If you want the chart to create the Secret, pass the token from a file instead of `--set` so the admin
token does not appear in process argv:

```bash
printf '%s' "$HONCHO_ADMIN_TOKEN" > /tmp/honcho-admin-token
helm install dashboard ./deploy/helm/honcho-dashboard \
  --set honcho.apiBase=https://honcho.example.com \
  --set-file secret.adminToken=/tmp/honcho-admin-token \
  --set ingress.hosts[0].host=dashboard.example.com
rm /tmp/honcho-admin-token
```

The dashboard is an admin-token BFF. Keep it on a trusted operator network; without per-user auth, any
same-origin POST in a reachable browser session can drive Honcho with the configured admin token.

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
| `secret.create` | `true` | Create the admin-token secret in-chart |
| `secret.adminToken` | `""` | Admin token (required when `create=true`) |
| `secret.existingSecretName` | `""` | Reference an external secret instead |
| `ingress.enabled` | `true` | Provision ingress |
| `metrics.enabled` | `false` | Render a Prometheus Operator ServiceMonitor |
| `metrics.path` | `/metrics` | Scrape path; scaffold only until the dashboard exposes metrics |
| `metrics.interval` | `30s` | ServiceMonitor scrape interval |
| `metrics.scrapeTimeout` | `10s` | ServiceMonitor scrape timeout |
| `metrics.additionalLabels` | `{}` | Extra labels such as `release: kube-prometheus-stack` |
| `replicaCount` | `1` | Pod replicas |
