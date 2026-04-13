import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false, // explicit imports — avoids polluting tsconfig
    include: ['src/__tests__/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['e2e/**/*.spec.ts', 'node_modules/**', '.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'e2e/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.config.*',
        '.next/**',
        'node_modules/**',
        'coverage/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
