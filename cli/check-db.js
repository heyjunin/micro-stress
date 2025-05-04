// Purpose: Check if the application can successfully connect to the database.

// Import only the database initializer
import { initializeDatabase } from '../bootstrap/database.js';

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    fgGreen: "\x1b[32m",
    fgRed: "\x1b[31m",
};

async function checkDatabaseConnection() {
    console.log(`${colors.bright}Attempting database connection...${colors.reset}`);
    try {
        // InitializeDatabase already contains the connection test (db.raw('SELECT 1'))
        const db = await initializeDatabase();
        console.log(`${colors.bright}${colors.fgGreen}✅ Database connection successful!${colors.reset}`);
        // Explicitly destroy the connection pool after checking
        await db.destroy();
        process.exit(0); // Exit with success code
    } catch (error) {
        console.error(`\n${colors.bright}${colors.fgRed}❌ Database connection failed:${colors.reset}`);
        console.error(error.message); // Print only the error message for clarity
        // You might want to print the full error in a debug mode
        // console.error(error);
        process.exit(1); // Exit with error code
    }
}

checkDatabaseConnection(); 