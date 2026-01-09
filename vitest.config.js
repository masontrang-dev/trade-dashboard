import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "backend/database/",
        "**/*.config.js",
        "**/*.setup.js",
        "**/test/**",
        "**/*.test.js",
        "**/*.spec.js",
      ],
      include: [
        "shared/**/*.js",
        "backend/models/**/*.js",
        "backend/routes/**/*.js",
        "backend/services/**/*.js",
        "frontend/src/**/*.{js,vue}",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./frontend/src"),
      "@shared": resolve(__dirname, "./shared"),
    },
  },
});
