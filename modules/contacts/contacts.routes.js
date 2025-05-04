import { contactController } from './contacts.controller.js';

// --- Schemas --- 

const contactProperties = {
    id: { type: 'integer' },
    name: { type: 'string', minLength: 2 },
    email: { type: 'string', format: 'email' },
    phone: { type: ['string', 'null'], minLength: 5 }, // Allow null or string
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
};

const contactSchema = {
    type: 'object',
    properties: contactProperties
};

const listContactsSchema = {
    // Add query string schema here for filtering/pagination if needed
    // querystring: {
    //     type: 'object',
    //     properties: {
    //         limit: { type: 'integer', minimum: 1, default: 10 },
    //         offset: { type: 'integer', minimum: 0, default: 0 }
    //     }
    // },
    response: {
        200: {
            description: 'List of contacts',
            type: 'array',
            items: contactSchema
        }
    }
};

const getContactSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'integer' }
        }
    },
    response: {
        200: {
            description: 'A single contact',
            ...contactSchema // Reuse the contact schema definition
        },
        404: { // Example for Not Found response
            description: 'Contact not found',
            type: 'object',
            properties: {
                statusCode: { type: 'integer', example: 404 },
                error: { type: 'string', example: 'Not Found' },
                message: { type: 'string' }
            }
        }
    }
};

const createContactSchema = {
    body: {
        type: 'object',
        required: ['name', 'email'], // Phone is optional
        properties: {
            name: contactProperties.name,
            email: contactProperties.email,
            phone: contactProperties.phone
        }
    },
    response: {
        201: {
            description: 'Newly created contact',
            ...contactSchema
        },
        400: { // Example for Bad Request (validation failure)
            description: 'Invalid input data',
            type: 'object',
            properties: {
                statusCode: { type: 'integer', example: 400 },
                error: { type: 'string', example: 'Bad Request' },
                message: { type: 'string' }
            }
        },
        409: { // Example for Conflict (email exists)
            description: 'Email already exists',
            type: 'object',
            properties: {
                statusCode: { type: 'integer', example: 409 },
                error: { type: 'string', example: 'Conflict' },
                message: { type: 'string' }
            }
        }
    }
};

const updateContactSchema = {
    params: getContactSchema.params, // Reuse params schema from getContactSchema
    body: {
        type: 'object',
        // No required fields, allow partial updates
        minProperties: 1, // Require at least one property to update
        properties: {
            name: contactProperties.name,
            email: contactProperties.email,
            phone: contactProperties.phone
        }
    },
    response: {
        200: {
            description: 'Updated contact',
            ...contactSchema
        },
        400: createContactSchema.response[400], // Reuse bad request schema
        404: getContactSchema.response[404], // Reuse not found schema
        409: createContactSchema.response[409]  // Reuse conflict schema
    }
};

const deleteContactSchema = {
    params: getContactSchema.params, // Reuse params schema
    response: {
        204: {
            description: 'Contact deleted successfully',
            type: 'null' // No body for 204 response
        },
        404: getContactSchema.response[404] // Reuse not found schema
    }
};


/**
 * Encapsulates the routes
 * @param {import("fastify").FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, Refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function contactRoutes(fastify, options) {

    fastify.get(
        '/',
        { schema: listContactsSchema },
        contactController.getAllContacts
    );

    fastify.get(
        '/:id',
        { schema: getContactSchema },
        contactController.getContactById
    );

    fastify.post(
        '/',
        { schema: createContactSchema },
        contactController.createContact
    );

    fastify.put(
        '/:id',
        { schema: updateContactSchema },
        contactController.updateContact
    );

    fastify.delete(
        '/:id',
        { schema: deleteContactSchema },
        contactController.deleteContact
    );
}

export default contactRoutes;
