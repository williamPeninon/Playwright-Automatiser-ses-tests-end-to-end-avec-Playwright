// @ts-check
// CORRIGÉ — Exercice 1 (J1) : message affiché quand la liste est vide
// Point clé : chaque test démarre avec une session neuve -> la liste est déjà vide,
// aucune boucle de suppression n'est nécessaire.
import { test, expect } from '@playwright/test';

test('affiche "Aucune tâche pour le moment" quand la liste est vide', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('empty-state')).toHaveText('Aucune tâche pour le moment');
});

test('le message disparaît dès qu\'une tâche est ajoutée et revient après suppression', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Première tâche');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page.getByTestId('empty-state')).toBeHidden();

  await page.getByRole('button', { name: 'Supprimer' }).click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});
