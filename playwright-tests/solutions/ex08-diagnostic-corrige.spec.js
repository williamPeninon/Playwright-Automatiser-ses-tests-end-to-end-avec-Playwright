// @ts-check
// CORRIGÉ — Exercice 8 (J2) : version réparée de tests/jour2/09-atelier-diagnostic.spec.js
//   Bug 1 : locator ambigu (strict mode violation) -> filtrer sur la ligne
//   Bug 2 : waitForTimeout + lecture immédiate -> assertion web-first
//   Bug 3 : test dépendant d'un autre test -> chaque test crée ses données
import { test, expect } from '@playwright/test';

test.describe('Atelier diagnostic (corrigé)', () => {
  test('bug 1 : supprimer la deuxième tâche', async ({ page }) => {
    await page.goto('/');
    for (const label of ['Garder', 'Jeter']) {
      await page.getByLabel('Nouvelle tâche').fill(label);
      await page.getByRole('button', { name: 'Ajouter' }).click();
    }
    await page.getByTestId('todo-item').filter({ hasText: 'Jeter' })
      .getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByTestId('todo-label')).toHaveText(['Garder']);
  });

  test('bug 2 : lire les statistiques', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('stats-total')).toHaveText('0');
  });

  test('bug 3 : terminer la tâche créée', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nouvelle tâche').fill('Tâche partagée');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await page.getByRole('button', { name: 'Terminer' }).click();
    await expect(page.getByTestId('todo-counter')).toHaveText('0 tâche restante');
  });
});
