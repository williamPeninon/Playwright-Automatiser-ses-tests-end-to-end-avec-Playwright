// @ts-check
// JOUR 1 — Actions utilisateur : saisir, sélectionner, cliquer, naviguer, clavier
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('ajouter une tâche avec une priorité (fill + selectOption + click)', { tag: '@smoke' }, async ({ page }) => {
  await page.getByLabel('Nouvelle tâche').fill('Réviser le Dockerfile');
  await page.getByLabel('Priorité').selectOption('haute'); // par value, ou { label: 'Haute' }
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const ligne = page.getByTestId('todo-item').filter({ hasText: 'Réviser le Dockerfile' });
  await expect(ligne).toBeVisible();
  await expect(ligne.getByTestId('todo-priority')).toHaveText('Haute');
});

test('valider le formulaire avec la touche Entrée (press)', async ({ page }) => {
  const champ = page.getByLabel('Nouvelle tâche');
  await champ.fill('Tâche saisie au clavier');
  await champ.press('Enter');

  await expect(page.getByTestId('todo-list')).toContainText('Tâche saisie au clavier');
});

test('supprimer une tâche', async ({ page }) => {
  // Le test crée lui-même ses données : il ne dépend d'aucun autre test
  await page.getByLabel('Nouvelle tâche').fill('Tâche à supprimer');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const ligne = page.getByTestId('todo-item').filter({ hasText: 'Tâche à supprimer' });
  await ligne.getByRole('button', { name: 'Supprimer' }).click();

  await expect(ligne).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('naviguer avec les filtres (click sur un lien + URL)', async ({ page }) => {
  await page.getByLabel('Nouvelle tâche').fill('Tâche filtrée');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await page.getByRole('link', { name: 'Terminées' }).click();
  await expect(page).toHaveURL(/filter=done/);
  await expect(page.getByTestId('empty-state')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('todo-list')).toContainText('Tâche filtrée');
});
