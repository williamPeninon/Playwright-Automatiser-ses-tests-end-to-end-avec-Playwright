// @ts-check
// JOUR 1 — Localisateurs (locators) et bonnes pratiques de sélection
//
// Ordre de préférence recommandé par Playwright :
//   1. getByRole      -> ce que voit l'utilisateur ET les technologies d'assistance
//   2. getByLabel / getByPlaceholder / getByText
//   3. getByTestId    -> contrat explicite avec les développeurs (data-testid)
//   4. locator('css') / XPath -> dernier recours, fragile
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('le même champ peut être ciblé de plusieurs façons', async ({ page }) => {
  const parRole = page.getByRole('textbox', { name: 'Nouvelle tâche' });
  const parLabel = page.getByLabel('Nouvelle tâche');
  const parPlaceholder = page.getByPlaceholder('Ex. : Réviser les locators');
  const parTestId = page.getByTestId('todo-input');
  const parCss = page.locator('#todo-input'); // à éviter : dépend de l'implémentation

  for (const locator of [parRole, parLabel, parPlaceholder, parTestId, parCss]) {
    await expect(locator).toBeVisible();
  }
});

test('chaîner et filtrer les locators pour cibler une ligne précise', async ({ page }) => {
  for (const label of ['Acheter du pain', 'Appeler le client']) {
    await page.getByLabel('Nouvelle tâche').fill(label);
    await page.getByRole('button', { name: 'Ajouter' }).click();
  }

  // getByRole('button', { name: 'Supprimer' }) correspond à 2 boutons :
  // une action sur ce locator échouerait en "strict mode violation".
  await expect(page.getByRole('button', { name: 'Supprimer' })).toHaveCount(2);

  // Solution : partir de la ligne (filter) puis descendre vers le bouton (chaînage)
  const ligne = page.getByRole('listitem').filter({ hasText: 'Appeler le client' });
  await expect(ligne.getByRole('button', { name: 'Supprimer' })).toBeVisible();
  await expect(ligne.getByTestId('todo-priority')).toHaveText('Normale');
});
