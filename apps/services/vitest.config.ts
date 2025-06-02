import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    setupFiles: 'dotenv/config',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    typecheck: {
      tsconfig: './tsconfig.json',
    },
    server: {
      sourcemap: 'inline',
    },
  },
  // test: {
  //   globals: true,
  //   // setupFiles: ["./src/modules/worklist/test/setup.ts"],
  //   // coverage: {
  //   //   provider: "v8",
  //   //   reporter: ["text", "json", "html"],
  //   //   exclude: [
  //   //     "node_modules/",
  //   //     "test/",
  //   //     "**/*.d.ts",
  //   //     "**/*.test.ts",
  //   //     "**/*.config.ts",
  //   //     "**/types.ts",
  //   //   ],
  //   // },
  //   // testTimeout: 10000,
  //   // hookTimeout: 10000,
  //   teardownTimeout: 10000,
  // },
  // //   resolve: {
  // //     alias: {
  // //       "@": resolve(__dirname, "./src"),
  // //     },
  // //   },
  // esbuild: {
  //   target: "esnext",
  //   format: "esm",
  // },
})
