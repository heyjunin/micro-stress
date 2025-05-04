# 4. Database (Knex)

The boilerplate uses Knex.js as a SQL query builder for interacting with the PostgreSQL database.

## Configuration

*   **`knexfile.js`:** This file defines the database connection configurations for different environments (development, test, production - though production is commented out by default). It imports the validated configuration from `config/index.js` to get the necessary connection details (host, port, user, password, database name, pool settings) based on the current `NODE_ENV`.
*   **`config/index.js`:** Provides the actual database connection parameters loaded from environment variables (see [Configuration](./03-configuration.md)).
*   **`bootstrap/database.js`:** Initializes the Knex instance using the configuration from `knexfile.js` and makes it available throughout the application. It also includes logic to test the connection on startup.

## Migrations

Migrations are used to manage database schema changes in a consistent and version-controlled way.

*   **Location:** `database/migrations/`
*   **Creating a Migration:**
    ```bash
    npm run db:migrate:make <migration_name>
    # Example: npm run db:migrate:make create_users_table
    ```
    This creates a new migration file with `up` and `down` methods.
    *   `up()`: Defines the schema changes to apply (e.g., create table, add column).
    *   `down()`: Defines how to reverse the changes made in `up()` (e.g., drop table, remove column).
*   **Running Migrations:**
    ```bash
    npm run db:migrate:latest
    ```
    This executes the `up()` method of all pending migrations.
*   **Rolling Back Migrations:**
    ```bash
    # Rollback the last batch of migrations
    npm run db:migrate:rollback

    # Rollback all migrations (useful for development/testing reset)
    npx knex migrate:rollback --all --knexfile knexfile.js
    ```
*   **Checking Status:**
    ```bash
    npm run cli:migrations:status
    ```
    Shows which migrations have been run and which are pending.
*   **Fresh Migrations (Development):** The boilerplate includes helper scripts to simulate Laravel's `migrate:fresh` command, useful for resetting the development database:
    ```bash
    # Rollback all, then run all migrations
    npm run db:migrate:fresh

    # Rollback all, run all migrations, then run all seeds
    npm run db:migrate:fresh:seed
    ```

## Seeds

Seeds are used to populate the database with initial or fake data, primarily for development and testing.

*   **Location:** `database/seeds/`
*   **Creating a Seed:**
    ```bash
    npm run db:seed:make <seed_name>
    # Example: npm run db:seed:make initial_contacts
    ```
*   **Running Seeds:**
    ```bash
    npm run db:seed:run
    ```
    This executes all seed files.
*   **Example (`contacts.seed.js`):** The boilerplate includes an example seed for the `contacts` table using `@faker-js/faker`. The number of contacts created is configurable via the `SEED_CONTACT_COUNT` environment variable.

## Database Interaction (Model Layer)

The actual database queries are typically encapsulated within the "model" files in each module (e.g., `modules/contacts/contacts.model.js`).

*   The initialized Knex instance is usually obtained via `getDatabaseInstance()` from `bootstrap/database.js` or passed down through the service layer.
*   The model functions use the Knex query builder syntax to perform CRUD operations (Create, Read, Update, Delete).

**Example (`contacts.model.js`):**
```javascript
import { getDatabaseInstance } from '../../bootstrap/database.js';

const TABLE_NAME = 'contacts';
const db = getDatabaseInstance();

export async function findAll() {
  return db(TABLE_NAME).select('*');
}

export async function findById(id) {
  return db(TABLE_NAME).where({ id }).first();
}

// ... other CRUD functions ...
```

Next: [API Development](./05-api-development.md) 