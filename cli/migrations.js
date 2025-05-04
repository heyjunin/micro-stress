// Purpose: Show the status of database migrations (executed and pending).

import { initializeDatabase } from '../bootstrap/database.js';

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgRed: "\x1b[31m",
    dim: "\x1b[2m",
};

async function checkMigrationStatus() {
    console.log(`${colors.bright}Checking migration status...${colors.reset}`);
    let db;
    try {
        // Need the DB instance to interact with migrations
        db = await initializeDatabase();

        // Get current migration version and list all migrations
        const currentVersion = await db.migrate.currentVersion();
        const allMigrations = await db.migrate.list();
        const [completedMigrations, pendingMigrations] = allMigrations;

        console.log(`  ${colors.fgYellow}Current migration version:${colors.reset} ${currentVersion}`);

        if (completedMigrations.length > 0) {
            console.log(`\n  ${colors.fgGreen}Executed Migrations:${colors.reset}`);
            completedMigrations.forEach(m => console.log(`    - ${m.name} ${colors.dim}(${m.file})${colors.reset}`));
        } else {
            console.log(`\n  ${colors.fgGreen}No migrations have been executed yet.${colors.reset}`);
        }

        if (pendingMigrations.length > 0) {
            console.log(`\n  ${colors.fgRed}Pending Migrations:${colors.reset}`);
            pendingMigrations.forEach(m => console.log(`    - ${m.name} ${colors.dim}(${m.file})${colors.reset}`));
        } else {
            console.log(`\n  ${colors.fgGreen}No pending migrations found. Database is up-to-date.${colors.reset}`);
        }

    } catch (error) {
        console.error(`\n${colors.bright}${colors.fgRed}❌ Failed to check migration status:${colors.reset}`);
        console.error(error.message);
        process.exitCode = 1; // Set error code but allow finally block to run
    } finally {
        // Ensure the connection pool is destroyed even if errors occurred
        if (db) {
            await db.destroy();
        }
    }
}

checkMigrationStatus(); 