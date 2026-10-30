/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Astro's Vite config lets unit tests render .astro components with the Container API.
export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
  },
});
