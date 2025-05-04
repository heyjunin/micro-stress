import { contactService } from './contacts.service.js';
import { trace, context } from '@opentelemetry/api';

export const contactController = {
    async getAllContacts(request, reply) {
        const span = trace.getSpan(context.active());
        request.log.info('Fetching all contacts');
        try {
            // Pass query parameters to service if needed for filtering/pagination
            const contacts = await contactService.listContacts(request.query);
            span?.setAttribute('app.contacts_count', contacts.length);
            return reply.send(contacts);
        } catch (error) {
            request.log.error({ err: error }, 'Error fetching contacts');
            throw error; // Let global handler manage response
        }
    },

    async getContactById(request, reply) {
        const span = trace.getSpan(context.active());
        const { id } = request.params;
        span?.setAttribute('app.contact_id', id);
        request.log.info({ contactId: id }, 'Fetching contact by ID');
        try {
            const contact = await contactService.getContactById(id);
            // Service throws 404 error if not found, global handler manages response
            return reply.send(contact);
        } catch (error) {
            request.log.error({ err: error, contactId: id }, 'Error fetching contact by ID');
            throw error;
        }
    },

    async createContact(request, reply) {
        const span = trace.getSpan(context.active());
        request.log.info('Creating new contact');
        try {
            const newContact = await contactService.createContact(request.body);
            span?.setAttribute('app.new_contact_id', newContact.id);
            // Add location header later if desired
            return reply.code(201).send(newContact);
        } catch (error) {
            request.log.error({ err: error, body: request.body }, 'Error creating contact');
            // Service might throw 409 (Conflict) or other errors
            throw error;
        }
    },

    async updateContact(request, reply) {
        const span = trace.getSpan(context.active());
        const { id } = request.params;
        span?.setAttribute('app.contact_id', id);
        request.log.info({ contactId: id }, 'Updating contact');
        try {
            const updatedContact = await contactService.updateContact(id, request.body);
            // Service throws 404 if not found
            return reply.send(updatedContact);
        } catch (error) {
            request.log.error({ err: error, contactId: id, body: request.body }, 'Error updating contact');
            throw error;
        }
    },

    async deleteContact(request, reply) {
        const span = trace.getSpan(context.active());
        const { id } = request.params;
        span?.setAttribute('app.contact_id', id);
        request.log.info({ contactId: id }, 'Deleting contact');
        try {
            await contactService.deleteContact(id);
            // Service throws 404 if not found
            return reply.code(204).send(); // No Content success response
        } catch (error) {
            request.log.error({ err: error, contactId: id }, 'Error deleting contact');
            throw error;
        }
    }
};
