// @ts-check
// Configuration réservée au formateur : exécute les corrigés des exercices (dossier solutions/).
// Usage : npm run test:solutions
import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config.js';

export default defineConfig({
  ...baseConfig,
  testDir: './solutions',
  projects: baseConfig.projects?.filter((project) => project.name === 'chromium'),
});
