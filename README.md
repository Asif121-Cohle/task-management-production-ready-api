# Task Management API

A production-oriented modular monolith for managing users, projects, and tasks. It demonstrates Node.js, Express, MongoDB, Mongoose, JWT authentication, role-based authorization, validation, testing, Docker, Kubernetes, Minikube, and GitHub Actions.

## Architecture

```text
Client
  |
  v
Express API
  |
  v
Middleware -> Controllers -> Services -> Mongoose -> MongoDB
```

Deployment flow:

```text
GitHub -> GitHub Actions -> Container Registry -> Kubernetes
                                      |
                                      v
                         Deployment -> Pods -> Service -> Ingress -> Users
```

## Technology Stack

- Node.js 20+
- Express.js
- MongoDB and Mongoose
- JWT and bcryptjs
- Zod validation
- Helmet, CORS, rate limiting, Morgan
- Jest and Supertest
- Swagger/OpenAPI
- Docker and Docker Compose
- Kubernetes and Minikube
- GitHub Actions

## Local Development

From the `backend` directory:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set `MONGO_URI` and `JWT_SECRET` in `.env`. The API listens on `http://localhost:5000` by default.

Useful checks:

```powershell
npm run lint
npm test
```

API health: `http://localhost:5000/api/v1/health`

Swagger UI: `http://localhost:5000/api-docs`

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port, default `5000` |
| `NODE_ENV` | `development`, `test`, or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret; use 32+ characters in production |
| `JWT_EXPIRES_IN` | JWT lifetime, for example `1d` |
| `CLIENT_URL` | Allowed CORS origin |

Never commit `.env`. Use a secret manager or protected CI/CD secret for production values.

## API Endpoints

Authentication:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

Projects require `Authorization: Bearer <token>`:

```text
POST   /api/v1/projects
GET    /api/v1/projects?page=1&limit=10
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
POST   /api/v1/projects/:id/members
```

Tasks require `Authorization: Bearer <token>`:

```text
POST   /api/v1/tasks
GET    /api/v1/tasks?status=completed&priority=high&project=<id>&page=1&limit=10
GET    /api/v1/tasks/:id
PUT    /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
PATCH  /api/v1/tasks/:id/status
PATCH  /api/v1/tasks/:id/assign
```

Users can access only projects they own or belong to. Admins can access all projects. Tasks inherit access from their project.

## Testing

Tests use Jest, Supertest, and an isolated `mongodb-memory-server` instance. They do not use your production database.

```powershell
npm test
```

The suite covers registration, duplicate emails, login failures, protected routes, project ownership, task authorization, task filtering, status changes, assignment, and health checks.

## Docker

Build and run the API image after starting Docker Desktop:

```powershell
docker build -t task-management-api:local .
docker run --rm -p 5000:5000 `
  -e NODE_ENV=production `
  -e PORT=5000 `
  -e MONGO_URI=mongodb://host.docker.internal:27017/task_management `
  -e JWT_SECRET=replace-with-a-long-secret `
  -e JWT_EXPIRES_IN=1d `
  -e CLIENT_URL=http://localhost:3000 `
  task-management-api:local
```

The image runs as the non-root `node` user and contains only production dependencies.

## Docker Compose

Compose starts the API and MongoDB with a persistent volume. The API uses the Compose service name `mongodb`, not `localhost`.

```powershell
docker compose up --build
docker compose ps
docker compose logs -f api
docker compose down
```

The MongoDB data volume remains after `down`. To remove it too:

```powershell
docker compose down -v
```

## Kubernetes and Minikube

The `k8s` directory contains:

- `namespace.yaml`: isolates application resources.
- `configmap.yaml`: non-secret configuration.
- `secret.yaml`: placeholder secret values for learning only.
- `mongodb.yaml`: single-node MongoDB Service and Deployment for Minikube learning.
- `deployment.yaml`: two API replicas, rolling updates, resource limits, and probes.
- `service.yaml`: stable internal ClusterIP endpoint for API pods.
- `ingress.yaml`: HTTP entry point to the Service.

The Kubernetes manifests include a single-node MongoDB deployment for Minikube learning. It uses ephemeral `emptyDir` storage, so it is not suitable for production. For production, remove `k8s/mongodb.yaml`, use a managed MongoDB service, and store its URI in a proper secret manager.

Start Minikube and enable Ingress:

```powershell
minikube start
minikube addons enable ingress
```

Build the image locally and load it into Minikube:

```powershell
docker build -t ghcr.io/your-github-owner/task-management-api:latest .
minikube image load ghcr.io/your-github-owner/task-management-api:latest
```

Before applying, update the image and replace the placeholder values in `k8s/secret.yaml`:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# The deployment manifest uses a registry placeholder by default.
# Override it after the Deployment exists when using the local Minikube image.
kubectl -n task-management set image deployment/task-management-api api=task-management-api:local
kubectl -n task-management rollout status deployment/mongodb
kubectl -n task-management rollout status deployment/task-management-api
```

Inspect the deployment:

```powershell
kubectl -n task-management get pods
kubectl -n task-management get service
kubectl -n task-management get ingress
kubectl -n task-management logs deployment/task-management-api
kubectl -n task-management rollout status deployment/task-management-api
```

Scale the API:

```powershell
kubectl -n task-management scale deployment/task-management-api --replicas=3
```

For local access without DNS setup:

```powershell
kubectl -n task-management port-forward service/task-management-api 5000:80
```

Then open `http://localhost:5000/api/v1/health`.

A Pod runs one application instance. A Deployment maintains the desired number of Pods. A Service provides stable networking to Pods. A ConfigMap stores non-sensitive settings. A Secret stores sensitive configuration. An Ingress routes external HTTP traffic to a Service.

## GitHub Actions

`CI` runs on pushes and pull requests:

1. Installs Node.js dependencies.
2. Runs lint.
3. Runs isolated API tests.
4. Builds the Docker image.

`Publish Docker Image` runs for version tags such as `v1.0.0` and can also be started manually. It tests the application, logs into GitHub Container Registry using the built-in `GITHUB_TOKEN`, and publishes both a commit SHA tag and a human-readable tag.

Create a release tag locally:

```powershell
git tag v1.0.0
git push origin v1.0.0
```

Update the image in `k8s/deployment.yaml` from the placeholder owner to your actual registry image. Prefer the immutable SHA tag for production deployments.

## CI/CD Architecture

```text
Pull Request -> CI: lint, test, docker build

Version Tag -> CI: lint, test -> Docker build -> GHCR push
                                      |
                                      v
                         Kubernetes deployment update
```

The repository does not automatically deploy to a cloud cluster. That final step should be connected later using a protected environment, workload identity, and a managed secret manager.

## Production Deployment Considerations

- Replace `k8s/secret.yaml` with an external secret manager or sealed secret workflow.
- Use a managed MongoDB cluster with backups, monitoring, and network restrictions.
- Use immutable image tags based on commit SHA.
- Restrict CORS to the real frontend origin.
- Configure TLS at the Ingress.
- Add centralized log collection and metrics.
- Set Kubernetes requests and limits based on observed usage.
- Keep database credentials and JWT secrets out of Git and Docker images.
- Run migrations or index management as a controlled release task when the schema evolves.
