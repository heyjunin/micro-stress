import {
    diag,
    DiagConsoleLogger,
    DiagLogLevel
} from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import config from '../config/index.js';

let sdkInstance = null;

export function initializeTracing() {
    if (sdkInstance) {
        return sdkInstance;
    }

    // Set up OpenTelemetry diagnostics (optional, good for debugging)
    // Set level to DEBUG for more verbose logs during development
    diag.setLogger(new DiagConsoleLogger(), config.env === 'development' ? DiagLogLevel.DEBUG : DiagLogLevel.INFO);

    const traceExporter = new OTLPTraceExporter({
        url: config.otel.exporter.url,
        ...(config.otel.exporter.headers && { headers: config.otel.exporter.headers }),
        ...(config.otel.exporter.compression && { compression: config.otel.exporter.compression }),
    });

    sdkInstance = new NodeSDK({
        serviceName: config.otel.serviceName,
        traceExporter: traceExporter,
        // Add other exporters like metrics or logs here if needed
        instrumentations: [
            new HttpInstrumentation(),
            new KnexInstrumentation(),
            new FastifyInstrumentation(),
            new IORedisInstrumentation(),
            // Add other instrumentations as needed (e.g., Redis, Kafka)
        ]
        // Add Resource Detectors for cloud metadata etc.
        // Add Samplers for controlling trace volume
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        sdkInstance.shutdown()
            .then(() => console.log('Tracing terminated'))
            .catch((error) => console.error('Error terminating tracing', error))
            .finally(() => process.exit(0));
    });

    try {
        sdkInstance.start();
        console.log('OpenTelemetry Tracing initialized successfully.');
    } catch (error) {
        console.error('Error initializing OpenTelemetry Tracing:', error);
        // Decide if the application should start without tracing or exit
        // process.exit(1);
    }

    return sdkInstance;
}

export function getSdkInstance() {
    if (!sdkInstance) {
        // This scenario might indicate an issue if accessed before initialization
        console.warn('Attempted to access SDK instance before initialization.');
        // Optionally, initialize here if it makes sense for your flow, or throw error
        // throw new Error('Tracing has not been initialized.');
    }
    return sdkInstance;
}
