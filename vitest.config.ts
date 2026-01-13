import dotenv from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

dotenv.config();

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    include: ["src/**/*.spec.ts", "src/**/*.test.ts", "tests/**/*.spec.ts", "tests/**/*.test.ts"],
                    exclude: [
                        "src/**/*.int.test.ts",
                        "src/**/*.integration.test.ts",
                        "tests/**/*.int.ts",
                        "tests/**/*.integration.ts",
                    ],
                    environment: "node",
                },
            },
            {
                extends: true,
                test: {
                    name: "integration",
                    include: [
                        "src/**/*.int.test.ts",
                        "src/**/*.integration.test.ts",
                        "tests/**/*.int.ts",
                        "tests/**/*.integration.ts",
                    ],
                    environment: "node",
                    testTimeout: 5000,
                    poolOptions: {
                        threads: {
                            singleThread: true,
                        },
                    },
                },
            },
        ],
    },
});
