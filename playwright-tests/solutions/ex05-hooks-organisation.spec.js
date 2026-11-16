// @ts-check
// CORRIGÉ — Exercice 5 (J2) : réorganiser avec describe, beforeEach, test.step et tags
import { test, expect } from '@playwright/test';

test.describe('Cycle de vie d\'une tâche', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nouvelle tâche').fill('Tâche de référence');
    await page.getByRole('button', { name: 'Ajouter' }).click();
  });

  test('une tâche ajoutée est active', { tag: '@smoke' }, async ({ page }) => {
    await expect(page.getByTestId('todo-item')).toHaveAttribute('data-completed', 'false');
  });

  test('une tâche peut être terminée puis réouverte', async ({ page }) => {
    const ligne = page.getByTestId('todo-item');
    await test.step('terminer', async () => {
      await ligne.getByRole('button', { name: 'Terminer' }).click();
      await expect(ligne).toHaveAttribute('data-completed', 'true');
    });
    await test.step('réouvrir', async () => {
      await ligne.getByRole('button', { name: 'Réouvrir' }).click();
      await expect(ligne).toHaveAttribute('data-completed', 'false');
    });
  });

  test('une tâche peut être supprimée', async ({ page }) => {
    await page.getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });
});
