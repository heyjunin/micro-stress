# 5. API Development

This section covers how to add new features and API endpoints using the boilerplate's modular structure.

## Creating a New Module

To add a new feature or resource (e.g., "products"), you typically create a new directory inside `modules/`:

```bash
mkdir modules/products
```

Inside this directory, create the following files (following the pattern of the `contacts` module):

1.  **`products.model.js`:**
    *   Handles direct database interaction for products using Knex.
    *   Exports functions like `create`, `findById`, `findAll`, `update`, `remove`.
    *   Gets the Knex instance from `bootstrap/database.js`.

2.  **`products.service.js`:**
    *   Contains the business logic related to products.
    *   Imports and uses functions from `products.model.js`.
    *   May perform additional validation, data manipulation, or orchestrate calls to other services.
    *   Publishes events to the event bus (e.g., `product.created`) after successful operations (see [Event Bus](./07-event-bus.md)).
    *   Handles errors from the model layer (e.g., unique constraint violations) and throws appropriate errors (potentially HTTP errors using `@fastify/sensible`) for the controller.

3.  **`products.controller.js`:**
    *   Acts as the intermediary between HTTP requests and the service layer.
    *   Exports handler functions for each API route (e.g., `createProduct`, `getProductById`).
    *   Parses request parameters (`request.params`), query strings (`request.query`), and body (`request.body`).
    *   Calls the corresponding methods in `products.service.js`.
    *   Formats the response using the `reply` object (e.g., `reply.code(201).send(newProduct)`).
    *   Handles errors thrown by the service layer and sends appropriate HTTP error responses.

4.  **`products.routes.js`:**
    *   Defines the API routes for the products module using Fastify's `register` plugin pattern.
    *   Imports controller handlers from `products.controller.js`.
    *   Defines request and response validation schemas using Zod (see below).
    *   Registers the routes with the Fastify instance, often prefixing them (e.g., `/api/products`).

5.  **Register the Module Routes:**
    *   In `src/server.js`, import your new routes file:
        ```javascript
        import productRoutes from './modules/products/products.routes.js';
        ```
    *   Register it with the Fastify instance, usually with a prefix:
        ```javascript
        fastify.register(productRoutes, { prefix: '/api/products' });
        ```

## Routing

Fastify's routing is defined within the module's `*.routes.js` file. Each route definition specifies:
*   HTTP Method (`GET`, `POST`, `PUT`, `DELETE`, etc.)
*   URL Path (relative to the prefix defined during registration)
*   Schema (for validation and serialization)
*   Handler function (imported from the controller)

**Example (`contacts.routes.js`):**
```javascript
async function contactRoutes(fastify, options) {
  fastify.post('/', {
    schema: createContactSchema, // See validation below
    handler: contactController.createContact
  });

  fastify.get('/:id', {
    schema: getContactSchema,
    handler: contactController.getContactById
  });
  // ... other routes
}
```

## Validation and Serialization (Zod Schemas)

The boilerplate leverages Fastify's built-in schema support, powered by Zod via `@fastify/sensible` (implicitly) or explicit schema definition.

*   **Schema Definition:** Schemas are defined in the `*.routes.js` file for request parts (body, querystring, params) and the expected response format.

    ```javascript
    import { z } from 'zod';

    const Contact = z.object({ /* ... Zod schema for contact ... */ });
    const ContactPayload = Contact.omit({ id: true, created_at: true, updated_at: true });

    const createContactSchema = {
      summary: 'Create a new contact',
      tags: ['Contacts'],
      body: ContactPayload,
      response: {
        201: Contact, // Success response schema
        400: z.object({ /* ... Zod schema for error ... */ }), // Error response
        409: z.object({ /* ... Zod schema for error ... */ }),
      },
    };
    ```
*   **Request Validation:** Fastify automatically validates incoming requests against the defined `body`, `querystring`, and `params` schemas. If validation fails, it sends a 400 Bad Request response by default.
*   **Response Serialization:** Fastify uses the `response` schema to serialize the outgoing payload, potentially filtering out unexpected properties and ensuring the response matches the documented schema.
*   **Swagger Generation:** These schemas are also used by `@fastify/swagger` to automatically generate the interactive API documentation available at `/documentation`.

## API Documentation (Swagger)

As mentioned, defining schemas in your route definitions automatically populates the Swagger UI.

*   Access the documentation at `/documentation` (when the server is running).
*   Use the `summary`, `description`, and `tags` properties within the schema object in your routes file to enhance the generated documentation.

Next: [Observability (Tracing & Logging)](./06-observability.md) 