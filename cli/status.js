// Purpose: Display key configuration and status information for the micro-stress boilerplate.

// Import the validated config. This also implicitly runs the validation.
import config from '../config/index.js';

// Colors for console output (optional, but nice)
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    fgGreen: "\x1b[32m",
    fgCyan: "\x1b[36m",
    fgYellow: "\x1b[33m",
};

function printHeader(title) {
    console.log(`\n${colors.bright}${colors.fgCyan}--- ${title} ---${colors.reset}`);
}

function printInfo(label, value) {
    // Avoid printing sensitive values like passwords
    const displayValue = label.toLowerCase().includes('password') ? '********' : value;
    console.log(`  ${colors.fgGreen}${label}:${colors.reset} ${displayValue}`);
}

console.log(`${colors.bright}Micro-Stress Status Check${colors.reset}`);

// --- Application Configuration ---
printHeader('Application');
printInfo('Node Environment', config.env);
printInfo('Service Name', config.otel.serviceName);
printInfo('Server Port', config.port);

// --- Database Configuration ---
printHeader('Database (PostgreSQL)');
printInfo('Host', config.db.connection.host);
printInfo('Port', config.db.connection.port);
printInfo('User', config.db.connection.user);
printInfo('Password', config.db.connection.password); // Masked by printInfo
printInfo('Database Name', config.db.connection.database);
printInfo('Use SSL', config.db.connection.ssl);
printInfo('Pool Min', config.db.pool.min);
printInfo('Pool Max', config.db.pool.max);

// --- Observability Configuration ---
printHeader('Observability (OpenTelemetry)');
printInfo('OTLP Endpoint (gRPC)', config.otel.exporter.url);
printInfo('OTLP Headers', config.otel.exporter.headers || 'N/A');
printInfo('OTLP Compression', config.otel.exporter.compression);

// --- Docker Compose Services Info (Based on common defaults) ---
printHeader('Docker Compose Services (Expected URLs)');
printInfo('PostgreSQL Port (Host)', 5432); // Assuming default mapping
printInfo('Jaeger UI', `http://localhost:8081`); // Based on docker-compose
printInfo('OTel Collector (gRPC)', `localhost:${config.otel.exporter.url.split(':')[2] || 4317}`); // Extract port

// --- Seed Configuration ---
printHeader('Seeding');
printInfo('Contact Seed Count', config.seed.contactCount);

console.log(`\n${colors.bright}Finished status check.${colors.reset}`); 