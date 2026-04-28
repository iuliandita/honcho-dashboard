# honcho-dashboard Helm chart

Self-hosted Honcho inspector. Renders the same Deployment / Service / Ingress / ConfigMap shape as
`deploy/k8s/` plain manifests, with values driven by `values.yaml`.

## Install

```bash
helm install dashboard ./deploy/helm/honcho-dashboard \
  --set honcho.apiBase=https://honcho.example.com \
  --set secret.adminToken=$HONCHO_ADMIN_TOKEN \
  --set ingress.hosts[0].host=dashboard.example.com
```

## Values reference

See [`values.yaml`](./values.yaml) for documented defaults and [`values.schema.json`](./values.schema.json)
for validation.

| Key | Default | Description |
|---|---|---|
| `image.repository` | `ghcr.io/REPLACE_ME/honcho-dashboard` | Container image |
| `image.tag` | `""` (= `.Chart.AppVersion`) | Image tag |
| `honcho.apiBase` | `https://REPLACE_ME-honcho.example.com` | Honcho API base URL (required) |
| `honcho.workspaceId` | `""` | Pin dashboard to one workspace; empty = picker mode |
| `honcho.proxyTimeout` | `15` | Upstream timeout (seconds) |
| `secret.create` | `true` | Create the admin-token secret in-chart |
| `secret.adminToken` | `""` | Admin token (required when `create=true`) |
| `secret.existingSecretName` | `""` | Reference an external secret instead |
| `ingress.enabled` | `true` | Provision ingress |
| `replicaCount` | `1` | Pod replicas |
