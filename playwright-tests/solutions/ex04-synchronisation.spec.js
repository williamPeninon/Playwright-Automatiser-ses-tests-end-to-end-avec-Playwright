// @ts-check
// CORRIGÉ — Exercice 4 (J1) : éléments dynamiques, sans aucun waitForTimeout
import { test, expect } from '@playwright/test';

test('les statistiques AJAX reflètent les tâches créées', async ({ page }) => {
  await page.goto('/');
  for (const label of ['A', 'B']) {
    await page.getByLabel('Nouvelle tâche').fill(label);
    await page.getByRole('button', { name: 'Ajouter' }).click();
  }
  await page.getByTestId('todo-item')
    .filter({ has: page.getByText('A', { exact: true }) })
    .getByRole('button', { name: 'Terminer' }).click();

  // Les stats arrivent 0,5 à 2 s après chaque chargement de page : expect attend
  await expect(page.getByTestId('stats-total')).toHaveText('2');
  await expect(page.getByTestId('stats-done')).toHaveText('1');
});

test('le toast disparaît et la liste peut être vidée après confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Tâche temporaire');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByRole('status')).toBeHidden();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Vider la liste' }).click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('bonus : un back-end lent (3 s) ne casse pas le test si le délai est adapté', async ({ page }) => {
  await page.route('**/api/stats', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.getByTestId('stats-total')).toHaveText('0', { timeout: 10_000 });
});
