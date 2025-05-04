import Redis from 'ioredis';
import config from '../config/index.js';
import { trace, context } from '@opentelemetry/api'; // Import OTel API

// Singleton instances for publisher and subscriber
let publisher;
let subscriber;
let isTerminating = false;

// Store handlers for subscribed events
const handlers = new Map();

function getPublisher() {
    if (!publisher) {
        console.log(`Initializing Redis publisher connection to: ${config.redis.url}`);
        publisher = new Redis(config.redis.url, {
            // Options to automatically retry connection
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000); // Exponential backoff
                console.warn(`Redis publisher connection failed. Retrying in ${delay}ms...`);
                return delay;
            },
            maxRetriesPerRequest: 3 // Avoid infinite loops on commands
        });
        publisher.on('error', (err) => console.error('Redis Publisher Error', err));
        publisher.on('connect', () => console.log('Redis Publisher connected.'));
        publisher.on('reconnecting', () => console.log('Redis Publisher reconnecting...'));
    }
    return publisher;
}

function getSubscriber() {
    if (!subscriber) {
        console.log(`Initializing Redis subscriber connection to: ${config.redis.url}`);
        // Use a separate connection for subscribing as recommended by Redis docs
        subscriber = new Redis(config.redis.url, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                console.warn(`Redis subscriber connection failed. Retrying in ${delay}ms...`);
                return delay;
            },
            maxRetriesPerRequest: null // Subscriber should keep trying to reconnect
        });

        subscriber.on('message', async (channel, message) => {
            const handler = handlers.get(channel);
            if (handler) {
                console.debug(`Received message on channel: ${channel}`);
                try {
                    const payload = JSON.parse(message);
                    // TODO: Add OTel context propagation from message headers/metadata if possible
                    // For now, we start a new span for the handler execution
                    const tracer = trace.getTracer(config.otel.serviceName);
                    await tracer.startActiveSpan(`EVENT_HANDLER ${channel}`, async (span) => {
                        span.setAttribute('messaging.system', 'redis');
                        span.setAttribute('messaging.destination', channel);
                        span.setAttribute('messaging.operation', 'process');
                        try {
                            await handler(payload);
                            span.setStatus({ code: trace.SpanStatusCode.OK });
                        } catch (error) {
                            console.error(`Error processing event from channel ${channel}:`, error);
                            span.setStatus({ code: trace.SpanStatusCode.ERROR, message: error.message });
                            span.recordException(error);
                            // Decide on error handling: retry, dead-letter queue, etc.
                        }
                        span.end();
                    });
                } catch (error) {
                    console.error(`Error parsing message or handling event for channel ${channel}:`, error);
                }
            } else {
                console.warn(`Received message on unsubscribed channel: ${channel}`);
            }
        });

        subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
        subscriber.on('connect', () => {
            console.log('Redis Subscriber connected.');
            // Re-subscribe to all registered channels on reconnect
            if (handlers.size > 0) {
                console.log('Re-subscribing to channels:', Array.from(handlers.keys()));
                subscriber.subscribe(...handlers.keys());
            }
        });
        subscriber.on('reconnecting', () => console.log('Redis Subscriber reconnecting...'));
    }
    return subscriber;
}

/**
 * Publishes an event payload to a specific channel/topic.
 * @param {string} eventName - The name of the event channel (e.g., 'contact.created').
 * @param {object} payload - The data payload for the event.
 */
export async function publish(eventName, payload) {
    if (isTerminating) {
      console.warn(`Attempted to publish event '${eventName}' during shutdown. Skipping.`);
      return;
    }
    try {
        const pub = getPublisher();
        const message = JSON.stringify(payload);
        // TODO: Add OTel context propagation headers/metadata to message if possible
        await pub.publish(eventName, message);
        console.debug(`Published event to channel: ${eventName}`);
    } catch (error) {
        console.error(`Failed to publish event ${eventName}:`, error);
        // Optional: Add retry logic or error handling
    }
}

/**
 * Subscribes a handler function to a specific event channel/topic.
 * @param {string} eventName - The name of the event channel to subscribe to.
 * @param {(payload: object) => Promise<void>} handler - The async function to execute when an event is received.
 */
export function subscribe(eventName, handler) {
    if (handlers.has(eventName)) {
        console.warn(`Handler already registered for event: ${eventName}. Overwriting.`);
    }
    const sub = getSubscriber(); // Ensure subscriber is initialized
    handlers.set(eventName, handler);
    sub.subscribe(eventName);
    console.log(`Subscribed handler to channel: ${eventName}`);
}

/**
 * Gracefully disconnects the Redis clients.
 */
export async function disconnectEventBus() {
    isTerminating = true;
    console.log('Disconnecting Redis clients...');
    const disconnectPromises = [];
    if (subscriber) {
        // Unsubscribe before quitting to avoid race conditions
        if (handlers.size > 0) {
             disconnectPromises.push(subscriber.unsubscribe(...handlers.keys()));
        }
        disconnectPromises.push(subscriber.quit());
        subscriber = null; // Clear instance
    }
    if (publisher) {
        disconnectPromises.push(publisher.quit());
        publisher = null; // Clear instance
    }
    await Promise.allSettled(disconnectPromises);
    console.log('Redis clients disconnected.');
} 