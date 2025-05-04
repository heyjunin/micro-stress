# 7. Event Bus (Redis Pub/Sub)

To facilitate communication between different parts of the application (or potentially between different microservices in the future) without tight coupling, the boilerplate includes a simple event bus pattern using Redis Pub/Sub.

## Setup

*   **Redis Service:** A Redis instance is provided by the `redis` service in `docker-compose.yml`.
*   **Configuration:** The Redis connection URL is configured via the `REDIS_URL` environment variable (e.g., `redis://micro-stress-redis:6379`).
*   **`core/event-bus.js`:** This file initializes and manages the Redis client connections:
    *   It creates two `ioredis` client instances: one for publishing (`publisher`) and one for subscribing (`subscriber`). Using separate clients is the standard practice for Redis Pub/Sub.
    *   It handles basic connection events (connect, error, reconnecting) and logs them.
    *   It exports `publish` and `subscribe` functions, along with `disconnectEventBus` for graceful shutdown.
*   **Instrumentation:** If `@opentelemetry/instrumentation-ioredis` is installed (it is in the dev dependencies), OpenTelemetry will automatically instrument Redis calls, adding spans to your traces when events are published or received.

## Publishing Events

To publish an event, import and call the `publish` function from `core/event-bus.js`.

*   **Location:** Typically called from the service layer *after* a core business operation has successfully completed.
*   **Arguments:**
    *   `channel` (String): The name of the channel to publish to (e.g., `contact.created`, `order.processed`).
    *   `message` (String): The payload of the event. **It's crucial to stringify your payload object (e.g., using `JSON.stringify()`) before publishing**, as Redis Pub/Sub transmits strings.

**Example (`contacts.service.js`):**
```javascript
import { publish } from '../../core/event-bus.js';
import * as contactModel from './contacts.model.js';

const CONTACT_CREATED = 'contact.created';

async function createContact(data) {
  const newContact = await contactModel.create(data);
  // Publish event AFTER successful creation
  await publish(CONTACT_CREATED, JSON.stringify(newContact)); // Stringify the payload
  return newContact;
}
```

## Subscribing to Events (Listening)

To react to published events, you need to subscribe to the relevant channels.

*   **`core/event-bus.js`:** Provides a `subscribe` function that takes a channel name and a handler function.
*   **Handler Function:** The provided handler function will be called whenever a message is received on the subscribed channel. It receives the channel name and the message (as a string) as arguments. Remember to parse the message (e.g., `JSON.parse()`) if it was originally an object.
*   **Initialization:** Subscriptions should be set up when the application starts.
A good place for this is often a dedicated `bootstrap/event-listeners.js` file (or similar) that is called from `src/server.js` after other core components are initialized.

**Example (Conceptual - place in `bootstrap/event-listeners.js` or similar):**
```javascript
// bootstrap/event-listeners.js (Example)
import { subscribe } from '../core/event-bus.js';
import { getLoggerInstance } from '../bootstrap/fastify.js'; // Or however you access the logger

const CONTACT_CREATED = 'contact.created';

function handleContactCreated(channel, message) {
  const logger = getLoggerInstance();
  try {
    const contact = JSON.parse(message); // Parse the string payload
    logger.info({ contactId: contact.id, channel }, '[EventListener] Received contact.created event, logging contact email:', contact.email);
    // TODO: Implement actual logic (e.g., send welcome email, update analytics)
  } catch (error) {
    logger.error({ channel, error }, '[EventListener] Error processing contact.created message');
  }
}

export function initializeEventListeners() {
  const logger = getLoggerInstance();
  logger.info('Initializing event listeners...');
  subscribe(CONTACT_CREATED, handleContactCreated);
  // subscribe('other.event', handleOtherEvent);
  logger.info('Event listeners initialized.');
}
```

Then, call `initializeEventListeners()` in `src/server.js` during startup.

## Graceful Shutdown

The `disconnectEventBus` function in `core/event-bus.js` should be called during the application's shutdown process (e.g., in Fastify's `onClose` hook or a dedicated shutdown handler) to properly close the Redis connections.

Next: [Testing](./08-testing.md) 