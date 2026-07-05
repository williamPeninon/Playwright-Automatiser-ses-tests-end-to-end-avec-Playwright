// Active la vérification de types TypeScript dans l'éditeur (sans compiler le fichier)
// @ts-check
// Importe les utilitaires de configuration et les profils d'appareils simulés
const { defineConfig, devices } = require('@playwright/test');

// Exporte la configuration Playwright utilisée par toutes les commandes npm
module.exports = defineConfig({
  // Dossier contenant les fichiers de test (*.spec.js)
  testDir: './tests',
  // Lance les tests en parallèle quand plusieurs workers sont disponibles
  fullyParallel: true,
  // En CI, interdit les tests marqués .only (évite de lancer un seul test par erreur)
  forbidOnly: !!process.env.CI,
  // En CI, réessaie une fois en cas d'échec ; en local, aucune nouvelle tentative
  retries: process.env.CI ? 1 : 0,
  // Formats de rapport générés après l'exécution des tests
  reporter: [
    // Affiche la progression dans le terminal
    ['list'],
    // Génère un rapport HTML consultable dans playwright-report/
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  // Options communes appliquées à chaque test
  use: {
    // URL de base de l'application Symfony (Docker ou local)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000',
    // Options de lancement du navigateur Chromium
    launchOptions: {
      // Ralentit l'automation si PLAYWRIGHT_SLOW_MO est défini (mode pédagogique)
      slowMo: process.env.PLAYWRIGHT_SLOW_MO
        ? Number(process.env.PLAYWRIGHT_SLOW_MO)
        : 0,
    },
    // Enregistre une trace détaillée uniquement lors d'une nouvelle tentative
    trace: 'on-first-retry',
    // Prend une capture d'écran uniquement en cas d'échec
    screenshot: 'only-on-failure',
  },
  // Liste des navigateurs / profils sur lesquels exécuter les tests
  projects: [
    {
      // Nom du projet affiché dans les rapports
      name: 'chromium',
      // Simule un Chrome de bureau avec une taille d'écran standard
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
