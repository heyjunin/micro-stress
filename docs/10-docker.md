# 10. Docker

Docker and Docker Compose are used to manage the development and testing environment, providing consistent instances of external services like databases, caches, and observability tools.

## Docker Compose (`docker-compose.yml`)

This file defines the multi-container setup for development dependencies.

*   **Services:**
    *   **`redis`:** Provides the Redis instance used for the event bus (Pub/Sub).
        *   Exposes port `6379` on the host.
        *   Uses a named volume `redis_data` for persistence (optional but included).
    *   **`jaeger`:** Runs the Jaeger all-in-one image for distributed tracing visualization.
        *   Exposes the UI on port `8081` (host) mapped from `16686` (container).
        *   Exposes collector ports (`14268`, `14250`).
    *   **`otel-collector`:** Runs the OpenTelemetry Collector.
        *   Configured via `otel-collector-config.yml` (mounted as a volume).
        *   Receives OTLP traces on ports `4317` (gRPC) and `4318` (HTTP).
        *   Exports traces to the `jaeger` service.
    *   **`postgres`:** Provides the PostgreSQL database.
        *   Exposes port `5432` on the host.
        *   Configured using environment variables (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`) which should align with your `.env` settings.
        *   Uses a named volume `postgres_data` to persist database data across container restarts.
*   **Network (`micro-stress-net`):**
    *   A custom bridge network is defined to allow containers to communicate with each other using their service names (e.g., the app connecting to `micro-stress-postgres`, the collector connecting to `jaeger`).
*   **Volumes (`postgres_data`, `redis_data`):**
    *   Named volumes ensure that data stored by PostgreSQL and Redis persists even if the containers are stopped and removed (unless `docker compose down -v` or `npm run docker:prune` is used).

*   **Management:** Use the `npm run docker:*` scripts (see [CLI Tools](./09-cli-tools.md)) or standard `docker compose` commands (`up`, `down`, `stop`, `ps`, `logs`) to manage these services.

## Dockerfile (TODO/Optional)

Currently, the boilerplate **does not include a `Dockerfile`** to containerize the Node.js application itself. The development workflow assumes you are running the Node.js application directly on your host machine while connecting to the services running in Docker Compose.

**Future Enhancement:**

A `Dockerfile` could be added to build an image for the Node.js application. This would typically involve:

1.  Choosing a base Node.js image (e.g., `node:20-alpine`).
2.  Setting the working directory.
3.  Copying `package.json` and `package-lock.json`.
4.  Running `npm install --production` to install only production dependencies.
5.  Copying the rest of the application code.
6.  Exposing the application port (`PORT`).
7.  Setting the default command to start the application (`CMD ["npm", "start"]`).

If a `Dockerfile` is added, you would also typically add an `app` (or similar) service definition to the `docker-compose.yml` file to run the application container alongside the other services, managing its build process, environment variables, ports, and network connections.

This setup would allow for a fully containerized development and deployment environment.

Previous: [CLI Tools](./09-cli-tools.md) | Back to [Index](./README.md) 