# honcho-dashboard plain manifests

Kustomize manifests for running the dashboard without Helm.

## Install

Create the admin-token Secret outside Git, then apply the manifests:

```bash
kubectl create secret generic honcho-dashboard-secret \
  --from-literal=HONCHO_ADMIN_TOKEN="$HONCHO_ADMIN_TOKEN"

kubectl apply -k deploy/k8s/
```

Edit `configmap.yaml`, `ingress.yaml`, and `deployment.yaml` to replace `REPLACE_ME` placeholders before
applying. `secret.example.yaml` is documentation only and is intentionally excluded from `kustomization.yaml`.

`servicemonitor.yaml` is also excluded by default. Add it from an overlay if the Prometheus Operator is
installed and you want ServiceMonitor discovery; the dashboard does not expose `/metrics` yet.

The dashboard is an admin-token BFF. Keep it on a trusted operator network; without per-user auth, any
same-origin POST in a reachable browser session can drive Honcho with the configured admin token.
