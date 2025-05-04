# 1. Getting Started

This guide explains how to set up and run the Micro-Stress boilerplate on your local machine.

## Prerequisites

*   **Node.js:** Version 20 or higher (check with `node -v`). We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions.
*   **Docker:** Required for running dependent services like PostgreSQL, Redis, Jaeger, and the OpenTelemetry Collector. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine.
*   **Docker Compose:** Usually included with Docker Desktop. Verify with `docker compose version`.

## Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url> micro-stress
    cd micro-stress
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   **Review and Customize `.env`:** Open the `.env` file and adjust the settings if necessary. Key variables:
        *   `DB_HOST`: Should be `micro-stress-postgres` (the service name in `docker-compose.yml`) if running the app *outside* Docker but connecting to Dockerized services. If running the app *inside* Docker (not set up by default), this would change.
        *   `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`: Ensure these match the `POSTGRES_*` variables in `docker-compose.yml`.
        *   `REDIS_URL`: Use `redis://micro-stress-redis:6379` to connect to the Dockerized Redis.
        *   `OTEL_EXPORTER_OTLP_ENDPOINT`: Use `http://micro-stress-otel-collector:4318` to send traces to the Dockerized Collector.
        *   Other variables like `PORT`, `LOG_LEVEL`, `SEED_CONTACT_COUNT` can be customized as needed.

4.  **Start Dependent Services:**
    Use Docker Compose to start PostgreSQL, Redis, Jaeger, and the OTEL Collector in the background:
    ```bash
    # Ensure Docker Desktop or Docker Engine is running
    npm run docker:up
    # Or directly: docker compose up -d
    ```
    *   You can check the status of the containers with `npm run docker:ps` (`docker compose ps`).
    *   You can view logs with `npm run docker:logs` (`docker compose logs -f`).

5.  **Run Database Migrations (and optionally Seeds):**
    Apply the database schema migrations:
    ```bash
    npm run db:migrate:latest
    ```
    To populate the database with initial fake data (useful for development):
    ```bash
    npm run db:seed:run
    ```

6.  **Run the Application:**
    *   **Development Mode (with watch and pretty logging):**
        ```bash
        npm run dev
        ```
        This will automatically restart the server on file changes.
    *   **Production Mode:**
        ```bash
        npm start
        ```

## Accessing Services

*   **API:** `http://localhost:8080` (or the `PORT` specified in `.env`)
*   **API Documentation (Swagger):** `http://localhost:8080/documentation`
*   **Jaeger UI (Tracing):** `http://localhost:8081`
*   **PostgreSQL:** Connect using a tool like DBeaver or `psql` to `localhost:5432` with credentials from `.env`.
*   **Redis:** Connect using a tool like RedisInsight or `redis-cli` to `localhost:6379`.

## Stopping Services

To stop the application, press `Ctrl+C` in the terminal where it's running.

To stop the Docker Compose services:
```bash
npm run docker:stop # Just stops containers
# OR
npm run docker:down # Stops and removes containers/networks
```

Next: [Project Structure](./02-project-structure.md) 