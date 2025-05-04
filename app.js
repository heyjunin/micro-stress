import { initializeTracing } from './bootstrap/tracing.js';
import { initializeServer } from './bootstrap/fastify.js';
import { initializeDatabase } from './bootstrap/database.js';
import { initializeAuditListeners } from './modules/audit-log/listeners.js';
import { disconnectEventBus } from './core/event-bus.js';
import config from './config/index.js';

async function startApp() {
    // 1. Initialize Tracing
    initializeTracing();

    // 2. Initialize Database Connection
    await initializeDatabase();

    // Initialize Event Listeners (after DB/config is ready, before server starts listening)
    initializeAuditListeners();

    // 3. Initialize Server
    const app = await initializeServer();

    // 4. Start Listening
    try {
        const address = await app.listen({ port: config.port, host: '0.0.0.0' });
        app.log.info(`Server listening on ${address}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }

    // Add graceful shutdown for event bus
    process.on('SIGINT', async () => await shutdown('SIGINT'));
    process.on('SIGTERM', async () => await shutdown('SIGTERM'));

    async function shutdown(signal) {
        console.log(`\nReceived ${signal}. Shutting down gracefully...`);
        try {
            // Disconnect event bus first
            await disconnectEventBus();
            // Close Fastify server
            await app.close();
            // DB connection is closed via Fastify's onClose hook
            console.log('Shutdown complete.');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    }

    return app;
}

export default startApp;
