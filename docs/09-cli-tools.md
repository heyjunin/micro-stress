# 9. CLI Tools

The boilerplate includes several utility scripts accessible via `npm run <script_name>` to assist with common development tasks.

## Database Management (Knex via npm)

These scripts wrap standard Knex commands:

*   `npm run db:migrate:make <migration_name>`: Creates a new migration file in `database/migrations/`.
*   `npm run db:migrate:latest`: Applies all pending migrations.
*   `npm run db:migrate:rollback`: Rolls back the last batch of migrations.
*   `npm run db:seed:make <seed_name>`: Creates a new seed file in `database/seeds/`.
*   `npm run db:seed:run`: Executes all seed files.

## Custom CLI Helpers (`cli/` directory)

These are simple Node.js scripts located in the `cli/` directory, providing project-specific information or actions.

*   **`npm run cli:status`:** (`cli/status.js`)
    *   Displays the current application status, including:
        *   Loaded environment (Development, Test, Production).
        *   API URL.
        *   Database connection details (host, port, user, database name - **password is masked**).
        *   Redis URL.
        *   OpenTelemetry configuration (service name, exporter endpoint).
    *   Useful for quickly verifying the configuration the application is running with.
*   **`npm run cli:check-db`:** (`cli/check-db.js`)
    *   Attempts to establish a connection to the configured database using Knex.
    *   Reports whether the connection was successful or if an error occurred.
    *   Helpful for diagnosing database connectivity issues.
*   **`npm run cli:migrations:status`:** (`cli/migrations.js`)
    *   Connects to the database and uses Knex to check the status of migrations.
    *   Lists migrations that have already run and those that are pending.
    *   Equivalent to running `npx knex migrate:status --knexfile knexfile.js` but integrated as an npm script.

## Development Workflow Helpers

These scripts combine other commands for common development scenarios:

*   **`npm run db:migrate:fresh`:**
    *   Simulates Laravel's `migrate:fresh`.
    *   Rolls back *all* existing migrations.
    *   Runs *all* migrations again.
    *   **Use with caution:** This effectively drops and recreates your database schema.
    *   Ideal for resetting your development database to a clean state.
*   **`npm run db:migrate:fresh:seed`:**
    *   Runs `npm run db:migrate:fresh`.
    *   Then runs `npm run db:seed:run`.
    *   Resets the schema and populates it with seed data in one command.

## Docker Compose Management (`docker:*`)

These scripts provide convenient wrappers around `docker compose` commands to manage the dependent services (Postgres, Redis, Jaeger, etc.).

*   `npm run docker:up`: Starts all services defined in `docker-compose.yml` in detached mode (`-d`).
*   `npm run docker:down`: Stops and removes containers, networks defined in `docker-compose.yml`.
*   `npm run docker:stop`: Stops running containers without removing them.
*   `npm run docker:prune`: **WARNING:** Stops and removes containers, networks, **AND VOLUMES**. This will delete persisted data (e.g., your PostgreSQL database). Use with extreme caution.
*   `npm run docker:build`: Builds or rebuilds the images for services (if applicable, usually more relevant if the application itself is Dockerized).
*   `npm run docker:build:nc`: Builds images without using the Docker cache.
*   `npm run docker:ps`: Lists the running containers managed by Docker Compose for this project.
*   `npm run docker:logs`: Shows and follows the logs from all running Docker Compose services (press `Ctrl+C` to stop following).

Next: [Docker](./10-docker.md) 