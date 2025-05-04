import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Ensure tests run in a Node.js environment
    environment: 'node',
    // Optional: Increase timeout for integration tests involving network/DB/Redis
    testTimeout: 15000, // 15 seconds
    // Optional: Setup file to run before tests (e.g., for global mocks or setup)
    // setupFiles: ['./tests/setup.js'],
    // Optional: Teardown file to run after tests
    // teardownFiles: ['./tests/teardown.js'],
    // Define include pattern for test files
    include: ['**/*.test.js', '**/*.spec.js'],
    // Exclude node_modules, build directories, etc.
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
}) 