import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
// import Redis from 'ioredis'; // No longer needed directly
import * as eventBus from '../../core/event-bus.js'; // Import the actual module
import { contactService } from './contacts.service.js';
import * as contactModel from './contacts.model.js';
// import config from '../../config/index.js'; // No longer needed for Redis URL

// Mock the event bus module
vi.mock('../../core/event-bus.js');
// Mock the model layer
vi.mock('./contacts.model.js');

// Cast the mocked module to access mocked functions easily
const mockEventBus = vi.mocked(eventBus);
const mockContactModel = vi.mocked(contactModel);

describe('Contacts Service - Event Publishing', () => {

    beforeEach(() => {
        // Reset mocks before each test
        mockReset(mockEventBus.publish);
        mockReset(mockContactModel.create);
        // Add resets for other mocked functions if needed (update, remove)
    });

    it('should publish contact.created event when a contact is created', async () => {
        const testData = { name: 'Test User', email: `test-${Date.now()}@example.com`, phone: '111-222-3333' };
        const mockCreatedContact = { id: 123, ...testData };
        const expectedChannel = 'contact.created';

        // Arrange: Setup mock implementations
        mockContactModel.create.mockResolvedValue(mockCreatedContact);
        // Mock `publish` to do nothing (or return a mock value if needed)
        mockEventBus.publish.mockResolvedValue(undefined);

        // Act: Call the service method
        const createdContact = await contactService.createContact(testData);

        // Assert: Check if the service returned the correct data
        expect(createdContact).toEqual(mockCreatedContact);

        // Assert: Check if the model's create function was called correctly
        expect(mockContactModel.create).toHaveBeenCalledTimes(1);
        expect(mockContactModel.create).toHaveBeenCalledWith(testData);

        // Assert: Check if the publish function was called correctly
        expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
        expect(mockEventBus.publish).toHaveBeenCalledWith(
            expectedChannel,
            JSON.stringify(mockCreatedContact) // Ensure payload matches the created contact
        );

        // No need to subscribe, wait, or unsubscribe with mocks
    });

    // Add similar tests for updateContact -> contact.updated
    // it('should publish contact.updated event when a contact is updated', async () => { ... });

    // Add similar tests for deleteContact -> contact.deleted
    // it('should publish contact.deleted event when a contact is deleted', async () => { ... });

});

// The Audit Log Listener test (if kept) would also need adjustments
// to mock the subscriber setup and event handling, or be moved to E2E/integration tests.
// For now, it remains commented out.
// describe('Audit Log Listener', () => { ... }); 