import * as contactModel from './contacts.model.js'; // Import functional model methods
import { publish } from '../../core/event-bus.js'; // Import the publish function
// Assuming you might use @fastify/sensible for httpErrors later
// import { default as sensible } from '@fastify/sensible';

const CONTACT_CREATED = 'contact.created';
const CONTACT_UPDATED = 'contact.updated';
const CONTACT_DELETED = 'contact.deleted';

export const contactService = {
    async listContacts(params) {
        // Logic for filtering, pagination, sorting can be added here
        return contactModel.findAll(params);
    },

    async getContactById(id) {
        const contact = await contactModel.findById(id);
        if (!contact) {
            // Example of throwing an error that the controller/handler can catch
            // If using @fastify/sensible: throw fastify.httpErrors.notFound('Contact not found');
            const error = new Error('Contact not found');
            error.statusCode = 404; // Attach status code for the error handler
            throw error;
        }
        return contact;
    },

    async createContact(data) {
        // Service layer could add more complex validation or business logic
        try {
            // Model function now handles basic validation or throws error
            const newContact = await contactModel.create(data);
            // Publish event AFTER successful creation
            // Publish the full created contact object
            await publish(CONTACT_CREATED, JSON.stringify(newContact));
            return newContact;
        } catch (error) {
            if (error.message.includes('unique constraint')) {
                const conflictError = new Error('Email already exists');
                conflictError.statusCode = 409;
                throw conflictError;
            }
            // Re-throw validation errors or others
            throw error;
        }
    },

    async updateContact(id, data) {
        // Ensure the contact exists first
        const existingContact = await contactModel.findById(id);
        if (!existingContact) {
            const error = new Error('Contact not found');
            error.statusCode = 404;
            throw error;
        }

        try {
            const updatedContact = await contactModel.update(id, data);
            if (updatedContact) { // Ensure update was successful
                // Publish event AFTER successful update
                await publish(CONTACT_UPDATED, JSON.stringify({ id: updatedContact.id, changes: data }));
            }
            return updatedContact;
        } catch (error) {
             // Handle potential database errors (like unique constraint)
             if (error.message.includes('unique constraint')) {
                const conflictError = new Error('Email already exists');
                conflictError.statusCode = 409; // Conflict
                throw conflictError;
            }
            // Re-throw other errors
            throw error;
        }
    },

    async deleteContact(id) {
        const deleted = await contactModel.remove(id); // Use the renamed function
        if (!deleted) {
            const error = new Error('Contact not found');
            error.statusCode = 404;
            throw error;
        }
        // Publish event AFTER successful deletion
        await publish(CONTACT_DELETED, JSON.stringify({ id: id }));
        // Return true or void, depending on desired API
        return true;
    }
};
