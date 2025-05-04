import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import { fileURLToPath } from 'url';

/**
 * Defines the expected environment variables schema using Zod.
 */
const envSchema = z.object({
    // Application
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(8080),

    // Database
    DB_CLIENT: z.enum(['pg']).default('pg'), // Add other clients if needed
    DB_HOST: z.string().min(1).default('localhost'),
    DB_PORT: z.coerce.number().int().positive().default(5432),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_DATABASE: z.string().min(1),
    DB_SSL: z.string().optional().default('false').transform(v => v === 'true'), // Handle boolean string
    DB_POOL_MIN: z.coerce.number().int().nonnegative().optional().default(2),
    DB_POOL_MAX: z.coerce.number().int().positive().optional().default(10),

    // Redis
    REDIS_URL: z.string().url().default('redis://localhost:6379'), // Default for local dev outside Docker

    // OpenTelemetry
    OTEL_SERVICE_NAME: z.string().min(1).default('micro-stress-api'),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().default('http://localhost:4317'),
    OTEL_EXPORTER_OTLP_HEADERS: z.string().optional(),
    OTEL_EXPORTER_OTLP_COMPRESSION: z.enum(['none', 'gzip']).optional().default('gzip'),

    // Seeding (Example)
    SEED_CONTACT_COUNT: z.coerce.number().int().nonnegative().optional().default(25)
});

/**
 * Loads environment variables from the correct .env file based on NODE_ENV,
 * validates them against the schema, and returns the typed environment object.
 * Exits the process if validation fails.
 */
export function validateAndLoadEnv() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Determine .env file path (e.g., .env, .env.test)
    const envPath = path.resolve(__dirname, `../.env${process.env.NODE_ENV === 'test' ? '.test' : ''}`);

    // Load environment variables from file
    dotenv.config({ path: envPath });

    console.log(`Attempting to load environment variables from: ${envPath}`);

    // Validate environment variables from process.env
    const parsedEnv = envSchema.safeParse(process.env);

    if (!parsedEnv.success) {
        console.error(
            '❌ Invalid environment variables:',
            JSON.stringify(parsedEnv.error.format(), null, 4)
        );
        process.exit(1); // Exit if validation fails
    }

    console.log('✅ Environment variables loaded and validated successfully.');
    // Return the validated and typed environment variables
    return parsedEnv.data;
}

// Export the Zod schema type if needed elsewhere (optional)
// export type Env = z.infer<typeof envSchema>; 