# Guardian Labs landing page on the shared VPS

This repository adds exactly one container to the VPS:

| Container | Internal address | Public route |
|---|---|---|
| `guardian-labs-landing` | `http://guardian-labs-landing:8080` | `https://guardian-labs.xyz` |

Traefik, Portainer, APIs, databases, and TLS state remain owned by the existing
Guardian Seal stack. The landing container joins its external Docker network
named `proxy`; it does not publish a host port.

## One-time VPS preparation

1. Point the `guardian-labs.xyz` DNS record to the VPS.
2. Confirm the shared resources already exist:

   ```bash
   docker network inspect proxy
   test -d /home/artero/DockerConfig/traefik/dynamic
   ```

3. Create the deployment workspace:

   ```bash
   mkdir -p /home/artero/workspace/guardian-landing
   ```

4. Add these GitHub Actions secrets:

   | Secret | Example or purpose |
   |---|---|
   | `DOCKERHUB_USERNAME` | Docker Hub namespace |
   | `DOCKERHUB_TOKEN` | Docker Hub access token |
   | `SSH_HOST` | VPS hostname or IP |
   | `SSH_USER` | `artero` |
   | `SSH_PRIVATE_KEY` | Private deployment key |
   | `SSH_PORT` | `22` |
   | `VPS_DEPLOY_PATH` | `/home/artero/workspace/guardian-landing` |
   | `VPS_TRAEFIK_DYNAMIC_PATH` | `/home/artero/DockerConfig/traefik/dynamic` |

The workflow copies the production Compose file and the landing-specific
Traefik route to the VPS. It starts the healthy container before installing the
route in Traefik's watched dynamic directory.

## Manual deployment

From a checkout on the VPS:

```bash
export DOCKERHUB_USERNAME=your-dockerhub-user
export IMAGE_TAG=latest

docker compose -f docker-compose.landing.prod.yml config --quiet
docker compose -f docker-compose.landing.prod.yml pull
docker compose -f docker-compose.landing.prod.yml up -d --wait

install -m 0644 \
  docker/traefik/traefik_dynamic.landing.toml \
  /home/artero/DockerConfig/traefik/dynamic/guardian-labs-landing.toml
```

The shared Traefik file provider watches that directory and reloads the route
without restarting Traefik.

## Verification

```bash
docker compose -f docker-compose.landing.prod.yml ps
docker exec guardian-labs-landing wget -qO- http://127.0.0.1:8080/healthz
curl -I http://guardian-labs.xyz
curl -I https://guardian-labs.xyz
```

Expected results:

- the Compose project lists only `guardian-labs-landing`;
- `/healthz` returns `ok`;
- HTTP redirects permanently to HTTPS;
- HTTPS serves the landing page with a Let's Encrypt certificate.

This deployment intentionally does not route `/api`. Any API or product
application must remain on its own service and hostname.

## Troubleshooting: Compose file not found

The production file is named `docker-compose.landing.prod.yml`. If a workflow
log still mentions the old `docker-compose.prod.yml` name, that run belongs to
an older commit. Do not use "Re-run failed jobs" on that historical run because
GitHub reuses its original workflow definition. Push the corrected workflow or
start a new run from the latest `main` branch:

```bash
gh workflow run deploy.yml --ref main
gh run watch
```

The workflow creates `VPS_DEPLOY_PATH` before uploading files and verifies the
Compose and Traefik files after SCP. `VPS_DEPLOY_PATH` must be an absolute Linux
directory, for example:

```text
/home/artero/workspace/guardian-landing
```
