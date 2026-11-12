// @ts-check
// JOUR 2 — Atelier diagnostic : ces 3 tests contiennent des erreurs VOLONTAIRES.
// Ils sont ignorés par défaut. Pour les lancer :
//   DIAGNOSTIC=1 npx playwright test 09-atelier --project=chromium --trace on
// (Windows PowerShell : $env:DIAGNOSTIC=1; npx playwright test 09-atelier --project=chromium --trace on)
// Puis : npx playwright show-report  -> ouvrez la trace de chaque échec.
import { test, expect } from '@playwright/test';

test.describe('Atelier diagnostic', () => {
  test.skip(!process.env.DIAGNOSTIC, 'Atelier diagnostic : lancer avec DIAGNOSTIC=1');

  test('bug 1 : supprimer la deuxième tâche', async ({ page }) => {
    await page.goto('/');
    for (const label of ['Garder', 'Jeter']) {
      await page.getByLabel('Nouvelle tâche').fill(label);
      await page.getByRole('button', { name: 'Ajouter' }).click();
    }
    await page.getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByTestId('todo-label')).toHaveText(['Garder']);
  });

  test('bug 2 : lire les statistiques', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(300);
    const total = await page.getByTestId('stats-total').textContent({ timeout: 1000 });
    expect(total).toBe('0');
  });

  test('bug 3 : terminer la tâche créée', async ({ page }) => {
    // Suppose que la tâche "Garder" du bug 1 existe encore...
    await page.goto('/');
    await page.getByRole('button', { name: 'Terminer' }).click();
    await expect(page.getByTestId('todo-counter')).toHaveText('0 tâche restante');
  });
});
