# 8. Testing

The boilerplate uses [Vitest](https://vitest.dev/) for running both unit and end-to-end (E2E) tests. Vitest provides a fast, modern testing experience with features like mocking, snapshot testing, and a Jest-compatible API.

## Running Tests

*   **Run all tests:**
    ```bash
    npm test
    ```
*   **Run tests in watch mode:**
    ```bash
    npm run test:watch
    ```

## Test Environment

*   **Configuration (`.env.test`):** When `npm test` is run, Vitest automatically sets `NODE_ENV=test`. The application then loads configuration from `.env.test` (see [Configuration](./03-configuration.md)). This file typically defines:
    *   A separate database (`DB_DATABASE=micro_stress_db_test`).
    *   Connection details pointing to `localhost` or `127.0.0.1` for Docker services (Postgres, Redis) exposed on the host.
    *   A `silent` log level (`LOG_LEVEL=silent`) to keep test output clean.
*   **Test Database Setup:**
    *   The `npm test` script first runs `npm run test:setup:db`. This script executes a `docker compose exec` command to create the test database (`micro_stress_db_test`) inside the running PostgreSQL container if it doesn't already exist.
    *   E2E test suites (`*.e2e.test.js`) are responsible for managing the schema *within* the test database:
        *   `beforeAll`: Runs `db.migrate.latest()` to ensure the schema is up-to-date.
        *   `beforeEach`: Runs `db('table_name').truncate()` to clear data from tables before each test, ensuring test isolation.
        *   `afterAll`: Runs `db.migrate.rollback(null, true)` to clean up the schema and `db.destroy()` to close the connection pool.

## Unit Tests (`*.test.js`)

*   **Purpose:** Test individual functions or units of code in isolation (e.g., service logic, model functions without hitting a real database).
*   **Location:** Typically placed alongside the code they test (e.g., `modules/contacts/contacts.test.js` tests `contacts.service.js`).
*   **Mocking:** Dependencies like database models or external services (like the event bus) should be mocked to isolate the unit under test.
    *   The boilerplate uses `vi.mock()` from Vitest and `vitest-mock-extended` to create mocks.
    *   **Example (`contacts.test.js`):** Mocks `core/event-bus.js` and `modules/contacts/contacts.model.js`. Tests verify that the service function calls the mocked model and publish functions with the expected arguments, without needing a real database or Redis connection.
    ```javascript
    import { describe, it, expect, beforeEach, vi } from 'vitest';
    import { mockReset } from 'vitest-mock-extended';
    import * as eventBus from '../../core/event-bus.js';
    import * as contactModel from './contacts.model.js';
    import { contactService } from './contacts.service.js';

    vi.mock('../../core/event-bus.js');
    vi.mock('./contacts.model.js');

    const mockEventBus = vi.mocked(eventBus);
    const mockContactModel = vi.mocked(contactModel);

    describe('Contacts Service', () => {
      beforeEach(() => {
        mockReset(mockEventBus.publish);
        mockReset(mockContactModel.create);
      });

      it('should call model.create and publish event', async () => {
        // Arrange
        const testData = { name: 'Test', email: 'test@test.com' };
        const mockContact = { id: 1, ...testData };
        mockContactModel.create.mockResolvedValue(mockContact);
        mockEventBus.publish.mockResolvedValue(undefined);

        // Act
        const result = await contactService.createContact(testData);

        // Assert
        expect(result).toEqual(mockContact);
        expect(mockContactModel.create).toHaveBeenCalledWith(testData);
        expect(mockEventBus.publish).toHaveBeenCalledWith('contact.created', JSON.stringify(mockContact));
      });
    });
    ```

## End-to-End Tests (`*.e2e.test.js`)

*   **Purpose:** Test the complete request/response cycle of the API, interacting with a real (test) database and other services like Redis.
*   **Location:** Usually within the module directory (e.g., `modules/contacts/contacts.e2e.test.js`).
*   **Tools:**
    *   **`supertest`:** Used to make HTTP requests to the running Fastify application and assert on the responses (status code, headers, body).
*   **Setup (`beforeAll`, `afterAll`, `beforeEach`):**
    *   Initialize the Fastify server and database connection in `beforeAll`.
    *   Run migrations in `beforeAll`.
    *   Truncate database tables in `beforeEach`.
    *   Rollback migrations, destroy the database connection, disconnect Redis, and close the server in `afterAll` (in the correct order to avoid connection issues).
*   **Test Structure:** Each `it` block typically represents a test case for a specific API endpoint and scenario.
    ```javascript
    import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
    import request from 'supertest';
    import { initializeServer } from '../../bootstrap/fastify.js';
    import { initializeDatabase, getDatabaseInstance } from '../../bootstrap/database.js';

    let app;
    let db;

    describe('Contacts API - E2E', () => {
      beforeAll(async () => {
        await initializeDatabase();
        db = getDatabaseInstance();
        await db.migrate.latest();
        app = await initializeServer();
        await app.ready();
      });

      afterAll(async () => { /* ... cleanup ... */ });
      beforeEach(async () => { await db('contacts').truncate(); });

      it('POST /api/contacts - should create a contact', async () => {
        const response = await request(app.server)
          .post('/api/contacts')
          .send({ name: 'E2E', email: 'e2e@test.com' })
          .expect(201)
          .expect('Content-Type', /json/);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('E2E');
      });
      // ... more tests
    });
    ```

Next: [CLI Tools](./09-cli-tools.md) 