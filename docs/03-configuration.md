# 3. Configuration

Configuration management is crucial for adapting the application to different environments (development, testing, production).

## Environment Variables (.env)

The primary method for configuration is through environment variables. The boilerplate uses the `dotenv` package to load variables from `.env` files.

*   **`.env.example`:** This file is committed to the repository and serves as a template listing *all* required and optional environment variables with default or example values. **Do not store secrets here.**
*   **`.env`:** This file is used for local development overrides. **It is listed in `.gitignore` and should NEVER be committed.** Copy `.env.example` to `.env` and fill in your local configuration (database passwords, etc.).
*   **`.env.test`:** Used specifically when running tests (`NODE_ENV=test`). This allows defining separate configurations, like a different database name, for the test environment. **It is also gitignored.**

In production environments, environment variables are typically injected directly into the process environment (e.g., by Docker, Kubernetes, PaaS providers) rather than using a `.env` file.

## Validation (Zod)

To ensure required environment variables are present and have the correct types, the boilerplate uses Zod for validation.

*   **`config/env.js`:** Defines the `envSchema` using Zod. This schema specifies:
    *   Expected variables (e.g., `DB_HOST`, `REDIS_URL`).
    *   Their types (string, number, enum, url).
    *   Whether they are required or optional.
    *   Default values for optional variables.
    *   Transformations (e.g., converting string 'true' to boolean `true`).
*   The `validateAndLoadEnv()` function in `config/env.js` performs the following:
    1.  Determines the correct `.env` file path based on `NODE_ENV`.
    2.  Loads variables from that file into `process.env` using `dotenv`.
    3.  Parses `process.env` using the `envSchema`.
    4.  **If validation fails, it prints an error detailing the missing/invalid variables and exits the application immediately.** This prevents the app from running with an invalid configuration.
    5.  If validation succeeds, it returns the parsed, typed, and defaulted configuration object.

## Usage (`config/index.js`)

The `config/index.js` file imports and calls `validateAndLoadEnv()` *once* when the application starts. It then structures the validated environment variables into a nested `config` object for cleaner access throughout the application.

**Example:** Accessing the database host:
```javascript
import config from './config/index.js';

const dbHost = config.db.connection.host;
console.log('Database host:', dbHost);
```

This approach ensures:
*   Configuration is loaded and validated early.
*   The application fails fast if configuration is invalid.
*   Accessing configuration values is type-safe and uses a consistent object structure.

Next: [Database (Knex)](./04-database.md) 