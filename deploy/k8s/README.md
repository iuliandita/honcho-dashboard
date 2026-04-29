# honcho-dashboard plain manifests

Kustomize manifests for running the dashboard without Helm.

## Install

Create the admin-token Secret outside Git, then apply the manifests:

```bash
kubectl create secret generic honcho-dashboard-secret \
  --from-literal=HONCHO_ADMIN_TOKEN="$HONCHO_ADMIN_TOKEN" \
  --from-literal=DASHBOARD_AUTH_PASSWORD_HASH="$DASHBOARD_AUTH_PASSWORD_HASH" \
  --from-literal=DASHBOARD_SESSION_SECRET="$DASHBOARD_SESSION_SECRET"

kubectl apply -k deploy/k8s/
```

Edit `configmap.yaml`, `ingress.yaml`, and `deployment.yaml` to replace `REPLACE_ME` placeholders before
applying. `secret.example.yaml` is documentation only and is intentionally excluded from `kustomization.yaml`.

`servicemonitor.yaml` is also excluded by default. Add it from an overlay if the Prometheus Operator is
installed and you want ServiceMonitor discovery; the dashboard does not expose `/metrics` yet.

Optional shared-password auth is configured with `DASHBOARD_AUTH_MODE=password`. Set
`DASHBOARD_SESSION_SECRET` and either `DASHBOARD_AUTH_PASSWORD_HASH` (preferred) or
`DASHBOARD_AUTH_PASSWORD` in the Secret. Leave `DASHBOARD_AUTH_MODE=off` for trusted-network-only installs.

The dashboard is an admin-token BFF. Keep it on a trusted operator network. Shared-password auth protects the
dashboard shell and proxied Honcho API requests, but it is intentionally not a multi-user or role-based system.
Keep `/healthz` public for probes. Do not expose the dashboard outside a trusted operator network unless
shared-password auth or reverse-proxy authentication is enabled.
