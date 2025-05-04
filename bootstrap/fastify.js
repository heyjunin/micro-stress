import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { trace, context, SpanStatusCode, diag } from '@opentelemetry/api'; // Import OTel API
import config from '../config/index.js';
import contactRoutes from '../modules/contacts/contacts.routes.js';
import { initializeDatabase } from './database.js';
// Import other route modules here as needed
// import courseRoutes from '../modules/courses/courses.routes.js';

// Helper to extract OTel context for logging
const getOtelContext = () => {
  const spanContext = trace.getSpanContext(context.active());
  if (!spanContext || !trace.isSpanContextValid(spanContext)) {
    return {};
  }
  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
    // trace_flags: spanContext.traceFlags, // Optional
  };
};

export async function initializeServer() {
    const app = Fastify({
        logger: {
            level: config.env === 'development' ? 'debug' : 'info',
            // Add mixin to inject OTel context into every log record
            mixin() {
              return getOtelContext();
            },
            // Use pino-pretty only in development
            transport: config.env === 'development' ? {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z', // More readable timestamp
                    ignore: 'pid,hostname,trace_id,span_id', // Hide these in pretty print
                    messageFormat: '{msg} {trace_id} {span_id}' // Optionally show trace/span in dev
                },
            } : undefined,
        }
    });

    // Register essential plugins
    await app.register(sensible);

    // Register Swagger - must be registered before routes
    await app.register(swagger, {
        swagger: {
            info: {
                title: 'micro-stress API', // Update title
                description: 'API documentation for the micro-stress Contacts service',
                version: config.version || '1.0.0' // Use version from config if available
            },
            // externalDocs: {
            //     url: 'https://swagger.io',
            //     description: 'Find more info here'
            // },
            host: `localhost:${config.port}`, // Dynamically set host
            schemes: ['http', 'https'], // Adjust as needed
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [
                { name: 'contacts', description: 'Contact related end-points' }
                // Add other tags as needed
            ],
            // securityDefinitions: { // Example for API Key auth
            //     apiKey: {
            //         type: 'apiKey',
            //         name: 'apiKey',
            //         in: 'header'
            //     }
            // }
        }
    });

    // Register Swagger UI - must be registered after @fastify/swagger
    await app.register(swaggerUi, {
        routePrefix: '/documentation', // URL to access the UI
        uiConfig: {
            docExpansion: 'list', // 'full', 'none' or 'list'
            deepLinking: false
        },
        // uiHooks: {
        //     onRequest: function (request, reply, next) { next() },
        //     preHandler: function (request, reply, next) { next() }
        // },
        staticCSP: true,
        // transformStaticCSP: (header) => header,
        // transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        // transformSpecificationClone: true
    });

    // Initialize Database
    const db = await initializeDatabase();

    // Add decorator for DB access
    app.decorate('db', db);

    // Enhanced Global Error Handling with OTel status
    app.setErrorHandler((error, request, reply) => {
        const traceId = getOtelContext().trace_id; // Get trace ID for logging
        app.log.error({ err: error, traceId }, `Error processing request: ${error.message}`);

        // Set OTel span status to ERROR
        const span = trace.getSpan(context.active());
        span?.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        // Optionally record the exception on the span
        // span?.recordException(error);

        // If the error has a statusCode (set by us or by sensible), use it
        const statusCode = error.statusCode || 500;

        // Use sensible's default error formatting or customize
        // In production, avoid sending detailed messages for 5xx errors
        if (statusCode >= 500 && config.env === 'production') {
             return reply.status(statusCode).send({
                statusCode: statusCode,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
             });
        }

        // For 4xx errors or non-production 5xx, send more details
        reply.status(statusCode).send({
            statusCode: statusCode,
            error: error.name || 'Error', // Use error name if available
            message: error.message
            // stack: config.env !== 'production' ? error.stack : undefined // Optionally add stack in dev
        });
    });

    // --- Register Routes ---
    app.register(contactRoutes, { prefix: '/api/contacts' });
    // app.register(courseRoutes, { prefix: '/api/courses' });

    // Basic health check route
    app.get('/health', (request, reply) => {
        reply.send({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Hook to close DB connection on server close
    app.addHook('onClose', async (instance) => {
        await instance.db.destroy();
        console.log('Database connection closed.');
    });

    // Ensure Swagger definitions are ready after routes are registered
    await app.ready();
    app.swagger(); // Generate the Swagger spec (needed for UI)

    return app;
}
