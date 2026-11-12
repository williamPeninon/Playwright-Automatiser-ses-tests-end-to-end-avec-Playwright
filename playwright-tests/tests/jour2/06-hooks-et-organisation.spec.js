// @ts-check
// JOUR 2 — Organisation d'une suite : describe, hooks, étapes, tags, annotations
//
// Conventions de nommage utilisées dans ce projet :
//   - un fichier = une fonctionnalité ou un chapitre : <numéro>-<sujet>.spec.js
//   - titre de test = comportement attendu, au présent, vu par l'utilisateur
//   - tags (@smoke, @regression) pour lancer un sous-ensemble : --grep @smoke
import { test, expect } from '@playwright/test';

test.describe('Filtrer les tâches', { tag: '@regression' }, () => {
  // beforeEach : exécuté avant CHAQUE test du bloc -> données de départ communes
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    for (const label of ['Tâche active', 'Tâche terminée']) {
      await page.getByLabel('Nouvelle tâche').fill(label);
      await page.getByRole('button', { name: 'Ajouter' }).click();
    }
    await page.getByTestId('todo-item')
      .filter({ hasText: 'Tâche terminée' })
      .getByRole('button', { name: 'Terminer' })
      .click();
    await expect(page.getByTestId('todo-counter')).toHaveText('1 tâche restante');
  });

  // afterEach : utile pour journaliser ou nettoyer des ressources externes
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      console.log(`Échec de "${testInfo.title}" sur ${page.url()}`);
    }
  });

  test('le filtre "Actives" n\'affiche que les tâches en cours', async ({ page }) => {
    await test.step('appliquer le filtre', async () => {
      await page.getByRole('link', { name: 'Actives' }).click();
    });
    await test.step('vérifier la liste', async () => {
      await expect(page.getByTestId('todo-label')).toHaveText(['Tâche active']);
      await expect(page.getByRole('link', { name: 'Actives' })).toHaveAttribute('aria-current', 'page');
    });
  });

  test('le filtre "Terminées" n\'affiche que les tâches terminées', async ({ page }) => {
    await page.getByRole('link', { name: 'Terminées' }).click();
    await expect(page.getByTestId('todo-label')).toHaveText(['Tâche terminée']);
  });

  test('réouvrir une tâche depuis le filtre "Terminées" la retire de la vue', async ({ page }) => {
    await page.getByRole('link', { name: 'Terminées' }).click();
    await page.getByRole('button', { name: 'Réouvrir' }).click();

    await expect(page).toHaveURL(/filter=done/);
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });
});

// Annotations : documenter un test ignoré ou un bug connu directement dans le rapport
test('export CSV des tâches', async () => {
  test.fixme(true, 'Fonctionnalité pas encore développée (ticket TODO-42)');
});
