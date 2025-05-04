import knex from 'knex';
import config from '../config/index.js';
import knexConfig from '../knexfile.js';

// Determine which environment configuration to use
const environment = config.env || 'development';
const dbConfig = knexConfig[environment];

let dbInstance = null;

export async function initializeDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    console.log(`Initializing database connection for environment: ${environment}`);
    dbInstance = knex(dbConfig);

    try {
        // Test the connection
        await dbInstance.raw('SELECT 1 as result');
        console.log('Database connection successful!');
        return dbInstance;
    } catch (error) {
        console.error('Database connection failed:', error);
        // Optional: Gracefully shutdown or retry logic
        process.exit(1); // Exit if DB connection fails on startup
    }
}

export function getDatabaseInstance() {
    if (!dbInstance) {
        throw new Error('Database has not been initialized. Call initializeDatabase first.');
    }
    return dbInstance;
}
