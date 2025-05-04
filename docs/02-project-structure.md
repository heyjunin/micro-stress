# 2. Project Structure

The boilerplate follows a modular structure designed for clarity and scalability.

```plaintext
micro-stress/
├── bootstrap/            # Initialization scripts for core components (Fastify, DB, Tracing, etc.)
│   ├── database.js
│   ├── event-listeners.js  # (Example location for event listeners)
│   ├── fastify.js
│   └── tracing.js
├── cli/                  # Command-line interface helper scripts
│   ├── check-db.js
│   ├── migrations.js
│   └── status.js
├── config/               # Configuration loading and validation
│   ├── env.js            # Zod schema for environment variables
│   └── index.js          # Loads and exports validated config
├── database/
│   ├── migrations/       # Knex database migration files
│   │   └── *.js
│   └── seeds/            # Knex database seed files
│       └── *.js
├── docs/                 # Project documentation (you are here!)
│   └── *.md
├── modules/              # Core application features/domains (e.g., contacts)
│   └── contacts/         # Example module for managing contacts
│       ├── contacts.controller.js # Handles HTTP requests and responses
│       ├── contacts.model.js      # Data access logic (interacts with DB)
│       ├── contacts.routes.js     # Defines API routes and validation schemas
│       ├── contacts.service.js    # Business logic, interacts with model and events
│       ├── contacts.e2e.test.js   # End-to-end tests for the module's API
│       └── contacts.test.js       # Unit tests for service/model logic
├── core/                 # Shared core functionalities (e.g., Event Bus)
│   └── event-bus.js
├── src/                  # Main application source entry point
│   └── server.js         # Initializes and starts the Fastify server
├── .env                  # Local environment variables (gitignored)
├── .env.example          # Example environment variables (commited)
├── .env.test             # Environment variables for testing (gitignored)
├── .gitignore
├── docker-compose.yml    # Defines development/testing services (DB, Redis, Jaeger, etc.)
├── Dockerfile            # (Optional/TODO) For containerizing the application itself
├── knexfile.js           # Knex configuration file
├── otel-collector-config.yml # OpenTelemetry Collector configuration
├── package.json
├── package-lock.json
└── README.md             # Main project README
```

## Key Directories

*   **`bootstrap/`:** Contains initialization logic for major components like Fastify, the database connection (Knex), OpenTelemetry tracing, and potentially event listeners. The `src/server.js` uses these to set up the application.
*   **`cli/`:** Holds simple Node.js scripts executable via `npm run cli:*` for common tasks like checking DB connection or migration status.
*   **`config/`:** Centralizes environment variable loading (`dotenv`) and validation (`zod`). `config/index.js` exports a clean, typed configuration object used throughout the application.
*   **`database/`:** Managed by Knex. Stores migration files (schema changes) and seed files (initial data).
*   **`modules/`:** The heart of your application. Each subdirectory represents a feature or domain (e.g., `contacts`, `users`, `products`).
    *   **Controller:** Handles incoming HTTP requests, parses input, calls the appropriate service, and formats the HTTP response.
    *   **Service:** Contains the core business logic for the module. Orchestrates calls to the model, publishes events, etc.
    *   **Model:** Responsible for data persistence logic, interacting directly with the database (using Knex in this case).
    *   **Routes:** Defines the API endpoints for the module using Fastify's routing syntax. Includes request/response validation schemas (using Zod).
    *   **Tests (`*.test.js`, `*.e2e.test.js`):** Unit and end-to-end tests specific to the module.
*   **`core/`:** Place for shared, cross-cutting concerns that don't belong to a specific module, like the event bus implementation.
*   **`src/`:** The main entry point (`server.js`) ties everything together by calling the bootstrap initializers.

Next: [Configuration](./03-configuration.md) 