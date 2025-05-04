# 6. Observability (Tracing & Logging)

Observability is a key aspect of understanding and debugging microservices. This boilerplate integrates OpenTelemetry for distributed tracing and Pino for structured logging.

## Distributed Tracing (OpenTelemetry)

OpenTelemetry provides vendor-neutral APIs and SDKs to instrument your application for distributed tracing.

*   **Setup (`bootstrap/tracing.js`):**
    *   Initializes the OpenTelemetry Node SDK.
    *   Configures the OTLP (OpenTelemetry Protocol) gRPC Exporter to send trace data to the OpenTelemetry Collector.
    *   The Collector endpoint is configured via the `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable (typically `http://micro-stress-otel-collector:4318` in development).
    *   Sets the service name using `OTEL_SERVICE_NAME`.
    *   Automatically instruments supported libraries like `fastify`, `http`, `knex`, and `ioredis` (if the instrumentation package is installed) to propagate trace context and generate spans for operations.
*   **OpenTelemetry Collector (`otel-collector-config.yml` & `docker-compose.yml`):**
    *   A dedicated `otel-collector` service is defined in `docker-compose.yml`.
    *   It receives traces from the application via OTLP (port 4318).
    *   It processes the traces (batching, etc.).
    *   It exports the traces to Jaeger (configured in `otel-collector-config.yml`).
*   **Jaeger UI:**
    *   The `jaeger` service in `docker-compose.yml` provides a UI for visualizing traces.
    *   Access it at `http://localhost:8081` (by default) to search for traces, view spans, and understand request lifecycles across services (if you had multiple services instrumented).
*   **Trace Context Propagation:** OpenTelemetry automatically handles injecting and extracting trace context (trace IDs, span IDs) across network requests (HTTP) and potentially message queues (if instrumented), allowing you to see the full journey of a request.

## Structured Logging (Pino)

Fastify uses Pino for high-performance JSON logging.

*   **Setup (`bootstrap/fastify.js`):**
    *   Fastify is initialized with Pino logging enabled.
    *   The `logLevel` is configured via the `LOG_LEVEL` environment variable (`info` by default, `silent` in tests).
*   **Trace Correlation:**
    *   The configuration in `bootstrap/fastify.js` uses `formatters.log` to **automatically inject the current `trace_id` and `span_id`** from OpenTelemetry into every log record.
    *   This allows you to easily correlate specific log messages with the distributed trace they belong to, greatly simplifying debugging in tools like Jaeger or other log aggregation platforms (e.g., Datadog, ELK Stack).
*   **Log Output:**
    *   **Development (`npm run dev`):** Logs are piped through `pino-pretty` for human-readable output in the console, including timestamps and log levels.
    *   **Production (`npm start`):** Logs are output as raw JSON lines. This format is ideal for ingestion by log management systems.
*   **Usage:** Use the standard Fastify logger instance available on the `request` object (`request.log`) or the global Fastify instance (`fastify.log`).
    ```javascript
    // In a route handler
    request.log.info({ userId: 123 }, 'User logged in');

    // Elsewhere (e.g., bootstrap)
    fastify.log.warn('Database connection slow');
    ```

## Metrics (Placeholder)

While OpenTelemetry also supports metrics, this boilerplate does not have specific metric collection configured yet.

*   **Integration Points:** You would typically use the OpenTelemetry Metrics API (`@opentelemetry/api`) to create instruments (Counters, Gauges, Histograms) and record measurements within your services (e.g., counting requests, measuring durations).
*   **Collector Configuration:** The OpenTelemetry Collector would need to be configured with a metrics receiver (e.g., OTLP) and a metrics exporter (e.g., Prometheus, Datadog).

Next: [Event Bus (Redis Pub/Sub)](./07-event-bus.md) 