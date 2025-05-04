import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest'; // Import supertest
import { initializeServer } from '../../bootstrap/fastify.js'; // Import server initializer
import { initializeDatabase, getDatabaseInstance } from '../../bootstrap/database.js'; // Import DB utils
import { disconnectEventBus } from '../../core/event-bus.js'; // Import event bus disconnect

// Hold the Fastify app instance
let app;
let db;

describe('Contacts API - E2E Tests', () => {
    // Start server and connect DB before all tests in this suite
    beforeAll(async () => {
        // Initialize DB (loads knexfile with NODE_ENV=test)
        await initializeDatabase();
        db = getDatabaseInstance();

        // Ensure migrations are run for the test database
        await db.migrate.latest();

        // Optional: Run seeds if needed for consistent test setup
        // await db.seed.run();

        app = await initializeServer(); // Initialize Fastify app
        await app.ready(); // Ensure all plugins are loaded
    });

    // Disconnect DB and close server after all tests
    afterAll(async () => {
        if (db) {
            try {
              // Rollback migrations BEFORE closing the app connection
              await db.migrate.rollback(null, true); // The `true` flag rolls back all migrations
            } catch (error) {
              console.error('Error during migration rollback:', error);
              // Decide if you want to throw or just log the error
            } finally {
              // Explicitly destroy the connection pool BEFORE closing the app
              await db.destroy();
            }
        }
        await disconnectEventBus(); // Disconnect Redis
        await app?.close(); // Close Fastify server LAST
    });

    // Clean the contacts table before each test using truncate
    beforeEach(async () => {
        await db('contacts').truncate();
    });

    // --- Test Cases ---

    it('POST /api/contacts - should create a new contact', async () => {
        const newContactData = {
            name: 'E2E Test User',
            email: `e2e-${Date.now()}@test.com`,
            phone: '555-1234'
        };

        const response = await request(app.server)
            .post('/api/contacts')
            .send(newContactData)
            .expect(201) // Expect HTTP status 201 Created
            .expect('Content-Type', /json/);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(newContactData.name);
        expect(response.body.email).toBe(newContactData.email);
        expect(response.body.phone).toBe(newContactData.phone);

        // Optionally verify in DB
        const dbContact = await db('contacts').where({ id: response.body.id }).first();
        expect(dbContact).toBeDefined();
        expect(dbContact.name).toBe(newContactData.name);
    });

    it('POST /api/contacts - should return 400 for invalid data', async () => {
        const invalidData = { name: 'Missing Email' }; // Email is required
        await request(app.server)
            .post('/api/contacts')
            .send(invalidData)
            .expect(400);
    });

    it('POST /api/contacts - should return 409 for duplicate email', async () => {
        const contact1 = { name: 'Duplicate Email', email: 'duplicate@test.com' };
        // Create the first contact
        await request(app.server).post('/api/contacts').send(contact1).expect(201);
        // Attempt to create another with the same email
        await request(app.server).post('/api/contacts').send(contact1).expect(409);
    });


    it('GET /api/contacts - should return a list of contacts', async () => {
        // Arrange: Create some contacts first
        await db('contacts').insert([
            { name: 'List User 1', email: 'list1@test.com' },
            { name: 'List User 2', email: 'list2@test.com' },
        ]);

        const response = await request(app.server)
            .get('/api/contacts')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThanOrEqual(2);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body.find(c => c.email === 'list1@test.com')).toBeDefined();
    });

    it('GET /api/contacts/:id - should return a single contact', async () => {
         // Arrange: Create a contact
        const [inserted] = await db('contacts').insert({ name: 'Get Me', email: 'getme@test.com' }).returning('id');
        const contactId = inserted.id;

        const response = await request(app.server)
            .get(`/api/contacts/${contactId}`)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.id).toBe(contactId);
        expect(response.body.name).toBe('Get Me');
    });

     it('GET /api/contacts/:id - should return 404 for non-existent contact', async () => {
        await request(app.server)
            .get('/api/contacts/999999') // Use an unlikely ID
            .expect(404);
    });

    it('PUT /api/contacts/:id - should update an existing contact', async () => {
         // Arrange: Create a contact
        const [inserted] = await db('contacts').insert({ name: 'Update Me', email: 'update@test.com' }).returning('id');
        const contactId = inserted.id;
        const updateData = { name: 'Updated Name', phone: '111-updated' };

        const response = await request(app.server)
            .put(`/api/contacts/${contactId}`)
            .send(updateData)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.id).toBe(contactId);
        expect(response.body.name).toBe(updateData.name);
        expect(response.body.phone).toBe(updateData.phone);
        expect(response.body.email).toBe('update@test.com'); // Email should not change
    });

    it('PUT /api/contacts/:id - should return 404 for non-existent contact', async () => {
         await request(app.server)
            .put('/api/contacts/999999')
            .send({ name: 'Does not exist' })
            .expect(404);
    });

    it('DELETE /api/contacts/:id - should delete a contact', async () => {
         // Arrange: Create a contact
        const [inserted] = await db('contacts').insert({ name: 'Delete Me', email: 'delete@test.com' }).returning('id');
        const contactId = inserted.id;

        // Act: Delete the contact
        await request(app.server)
            .delete(`/api/contacts/${contactId}`)
            .expect(204); // Expect No Content

        // Assert: Verify it's gone from DB
        const dbContact = await db('contacts').where({ id: contactId }).first();
        expect(dbContact).toBeUndefined();

        // Assert: Verify API returns 404 for the deleted ID
        await request(app.server)
            .get(`/api/contacts/${contactId}`)
            .expect(404);
    });

    it('DELETE /api/contacts/:id - should return 404 for non-existent contact', async () => {
        await request(app.server)
            .delete('/api/contacts/999999')
            .expect(404);
    });
}); 