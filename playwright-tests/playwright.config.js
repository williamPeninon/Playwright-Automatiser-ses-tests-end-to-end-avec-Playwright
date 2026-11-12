// @ts-check
// Configuration Playwright de la formation (chapitres concernés entre crochets).
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const slowMo = Number(process.env.PLAYWRIGHT_SLOW_MO || 0);


export default defineConfig({
  // [J1] Dossier contenant les fichiers *.spec.js
  testDir: './tests',

  // [J2] Parallélisation : chaque test de chaque fichier peut tourner dans un worker différent
  fullyParallel: true,
  // [J2] Nombre de workers : automatique en local (moitié des cœurs), 2 en CI pour rester stable
  workers: isCI ? 2 : undefined,

  // [J2] En CI : interdit les test.only oubliés et réessaie 2 fois un test en échec
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,

  // [J1] Délai max d'un test (30 s par défaut) et des assertions expect (5 s par défaut)
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // [J2] Rapports : liste dans le terminal + HTML ; en CI on ajoute JUnit (lu par GitLab / GitHub)
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'junit/results.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    // [J1] URL de l'application : localhost en local, http://todo-app:8000 dans Docker / GitLab
    // (jamais http://app:8000 : ".app" est un domaine que les navigateurs forcent en HTTPS)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000',

    // [J2] Artefacts de diagnostic
    trace: 'on-first-retry',          // trace complète rejouable dans le Trace Viewer
    screenshot: 'only-on-failure',    // capture d'écran si le test échoue
    video: 'retain-on-failure',       // vidéo conservée uniquement en cas d'échec

    // [J1] Mode pédagogique : ralentit chaque action (npm run test:pedagogique)
    launchOptions: { slowMo },
  },

  // [J2] Exécution multi-navigateurs : un "projet" par navigateur / appareil
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
