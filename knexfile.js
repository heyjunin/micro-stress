import path from 'path';
import config from './config/index.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Update this configuration to match your setup
const knexConfig = {
  development: {
    client: config.db.client,
    connection: config.db.connection,
    pool: config.db.pool,
    migrations: config.db.migrations,
    seeds: config.db.seeds
  },

  // Example for production environment (adjust as needed)
  /*
  production: {
    client: config.db.client,
    connection: config.db.connection,
    pool: config.db.pool,
    migrations: config.db.migrations,
    seeds: config.db.seeds
  }
  */

  // Configuração para o ambiente de teste
  test: {
    client: config.db.client, // Use client from loaded test env config
    connection: config.db.connection, // Use connection details from loaded test env config
    pool: {
      min: 0, // Pode usar pool menor para testes
      max: 5
    },
    migrations: config.db.migrations, // Use the same migration path
    seeds: config.db.seeds, // Use the same seed path
    // useNullAsDefault: true // Only needed for SQLite
  }
};

export default knexConfig;
