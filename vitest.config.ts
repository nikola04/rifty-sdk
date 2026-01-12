import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv'

dotenv.config();

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        projects: [{
            extends: true,
            test: {
                name: 'unit',
                include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
                exclude: ['src/**/*.int.test.ts', 'src/**/*.integration.test.ts'],
                environment: 'node',
            }
        }, {
            extends: true,
            test: {
                name: 'integration',
                include: ['src/**/*.int.test.ts', 'src/**/*.integration.test.ts'],
                environment: 'node',
                testTimeout: 5000,
                poolOptions: {
                    threads: {
                        singleThread: true
                    }
                }
            },
        }]
    },
});