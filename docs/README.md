# Micro-Stress Boilerplate Documentation

Welcome to the documentation for the Micro-Stress boilerplate!

This project provides a solid foundation for building Node.js microservices using a modern stack, focusing on developer experience, observability, and best practices.

## Technology Stack

*   **Framework:** [Fastify](https://fastify.dev/) (High-performance Node.js web framework)
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
*   **ORM/Query Builder:** [Knex.js](https://knexjs.org/) (SQL query builder)
*   **Configuration:** [dotenv](https://github.com/motdotla/dotenv) + [Zod](https://zod.dev/) (Environment-based config with validation)
*   **Observability:**
    *   **Tracing:** [OpenTelemetry](https://opentelemetry.io/) (Vendor-neutral tracing) + [Jaeger UI](https://www.jaegertracing.io/)
    *   **Logging:** [Pino](https://getpino.io/) (Fast, low-overhead JSON logger integrated with Fastify)
    *   **Metrics:** (Placeholder - ready for integration)
*   **Event Bus:** [Redis](https://redis.io/) (Pub/Sub for inter-service communication)
*   **Testing:** [Vitest](https://vitest.dev/) (Fast unit and E2E testing framework) + [Supertest](https://github.com/ladjs/supertest) (HTTP assertions)
*   **API Documentation:** [Fastify Swagger](https://github.com/fastify/fastify-swagger) (Automatic Swagger/OpenAPI documentation)
*   **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## Documentation Index

1.  [Getting Started](./01-getting-started.md)
2.  [Project Structure](./02-project-structure.md)
3.  [Configuration](./03-configuration.md)
4.  [Database (Knex)](./04-database.md)
5.  [API Development](./05-api-development.md)
6.  [Observability (Tracing & Logging)](./06-observability.md)
7.  [Event Bus (Redis Pub/Sub)](./07-event-bus.md)
8.  [Testing](./08-testing.md)
9.  [CLI Tools](./09-cli-tools.md)
10. [Docker](./10-docker.md)

Dive into the sections above to understand how to set up, run, develop, and test your microservices using this boilerplate. 