# honcho-dashboard plain manifests

Kustomize manifests for running the dashboard without Helm.

## Install

Create the admin-token Secret outside Git, then apply the manifests. For password auth, generate a Bun
password hash locally and store the hash rather than a plaintext dashboard password:

```bash
export DASHBOARD_AUTH_PASSWORD='choose-a-strong-operator-password'
export DASHBOARD_AUTH_PASSWORD_HASH="$(
  bun -e 'console.log(await Bun.password.hash(process.env.DASHBOARD_AUTH_PASSWORD ?? ""))'
)"
export DASHBOARD_SESSION_SECRET="$(openssl rand -base64 32)"
```

```bash
kubectl create secret generic honcho-dashboard-secret \
  --from-literal=HONCHO_ADMIN_TOKEN="$HONCHO_ADMIN_TOKEN" \
  --from-literal=DASHBOARD_AUTH_PASSWORD_HASH="$DASHBOARD_AUTH_PASSWORD_HASH" \
  --from-literal=DASHBOARD_SESSION_SECRET="$DASHBOARD_SESSION_SECRET"

kubectl apply -k deploy/k8s/
```

Edit `configmap.yaml` and `ingress.yaml` to replace `REPLACE_ME` placeholders before applying. Set
`DASHBOARD_AUTH_MODE=password` in `configmap.yaml` when using the password Secret values above.
`secret.example.yaml` is documentation only and is intentionally excluded from `kustomization.yaml`.

The default image is `ghcr.io/iuliandita/honcho-dashboard:1.6.1`. Release image tags omit the leading `v`
even though Git tags include it: use image tag `1.6.1` for Git tag `v1.6.1`.

`servicemonitor.yaml` is also excluded by default. Add it from an overlay if the Prometheus Operator is
installed and you want ServiceMonitor discovery; the dashboard does not expose `/metrics` yet.

`networkpolicy.example.yaml` is excluded by default. It shows the usual default-deny shape plus explicit
allow rules for ingress-nginx to reach the dashboard, the dashboard to reach the Honcho API, and the dashboard
to resolve kube-dns. Replace namespace labels, pod selectors, and ports for your cluster before enabling it.

Optional shared-password auth is configured with `DASHBOARD_AUTH_MODE=password`. Set
`DASHBOARD_SESSION_SECRET` and either `DASHBOARD_AUTH_PASSWORD_HASH` (preferred) or
`DASHBOARD_AUTH_PASSWORD` in the Secret. Leave `DASHBOARD_AUTH_MODE=off` for trusted-network-only installs.

The dashboard is an admin-token BFF. Keep it on a trusted operator network. Shared-password auth protects the
dashboard shell and proxied Honcho API requests, but it is intentionally not a multi-user or role-based system.
Keep `/healthz` public for probes. Do not expose the dashboard outside a trusted operator network unless
shared-password auth or reverse-proxy authentication is enabled.

`ingress.yaml` assumes ingress-nginx and cert-manager-managed TLS. If TLS is terminated by an external reverse
proxy instead, remove the `cert-manager.io/cluster-issuer` annotation and the `spec.tls` block, or skip the
Ingress manifest and point the external proxy at the `honcho-dashboard` Service.
