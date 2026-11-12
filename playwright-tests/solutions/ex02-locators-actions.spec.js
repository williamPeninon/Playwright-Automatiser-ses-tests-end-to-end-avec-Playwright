// @ts-check
// CORRIGÉ — Exercice 2 (J1) : localisateurs et actions
// Ajouter deux tâches de priorités différentes, supprimer la tâche "Haute"
// en ciblant le bon bouton "Supprimer" (filter + chaînage).
import { test, expect } from '@playwright/test';

test('supprimer précisément la tâche de priorité haute', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Nouvelle tâche').fill('Tâche urgente');
  await page.getByLabel('Priorité').selectOption({ label: 'Haute' });
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await page.getByLabel('Nouvelle tâche').fill('Tâche tranquille');
  await page.getByLabel('Priorité').selectOption({ label: 'Basse' });
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await page.getByRole('listitem')
    .filter({ has: page.getByTestId('todo-priority').filter({ hasText: 'Haute' }) })
    .getByRole('button', { name: 'Supprimer' })
    .click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-label')).toHaveText('Tâche tranquille');
  await expect(page.getByTestId('todo-priority')).toHaveText('Basse');
});
