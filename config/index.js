import path from 'path'
import { fileURLToPath } from 'url'
import { validateAndLoadEnv } from './env.js'

// Validate and load environment variables ONCE on import
const env = validateAndLoadEnv()

// Build the config object using the validated environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  db: {
    client: env.DB_CLIENT,
    connection: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_DATABASE,
      ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: env.DB_POOL_MIN,
      max: env.DB_POOL_MAX
    },
    migrations: {
      directory: path.resolve(__dirname, '../database/migrations'),
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: path.resolve(__dirname, '../database/seeds')
    }
  },
  otel: {
    serviceName: env.OTEL_SERVICE_NAME,
    exporter: {
      url: env.OTEL_EXPORTER_OTLP_ENDPOINT,
      headers: env.OTEL_EXPORTER_OTLP_HEADERS,
      compression: env.OTEL_EXPORTER_OTLP_COMPRESSION
    }
  },
  seed: {
    contactCount: env.SEED_CONTACT_COUNT
  },
  redis: {
    url: env.REDIS_URL
  }
}

export default config
