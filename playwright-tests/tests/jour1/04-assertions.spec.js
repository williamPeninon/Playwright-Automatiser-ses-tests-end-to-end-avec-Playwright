// @ts-check
// JOUR 1 — Assertions : contrôler le comportement et l'état de l'application
//
// Besoin fonctionnel (user story) :
//   En tant qu'utilisateur, je veux marquer une tâche comme terminée puis annuler
//   ce statut, afin de suivre l'avancement sans supprimer mes tâches.
import { test, expect } from '@playwright/test';

test('terminer puis réouvrir une tâche met à jour l\'état et le compteur', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Tâche à terminer');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const ligne = page.getByTestId('todo-item').filter({ hasText: 'Tâche à terminer' });
  const compteur = page.getByTestId('todo-counter');
  await expect(compteur).toHaveText('1 tâche restante');

  // Terminer
  await ligne.getByRole('button', { name: 'Terminer' }).click();
  await expect(ligne).toHaveAttribute('data-completed', 'true');           // attribut
  await expect(ligne.getByTestId('todo-label')).toHaveClass(/is-done/);    // classe CSS
  await expect(ligne.getByRole('button', { name: 'Réouvrir' })).toBeVisible(); // libellé du bouton
  await expect(compteur).toHaveText('0 tâche restante');

  // Réouvrir
  await ligne.getByRole('button', { name: 'Réouvrir' }).click();
  await expect(ligne).toHaveAttribute('data-completed', 'false');
  await expect(ligne.getByTestId('todo-label')).not.toHaveClass(/is-done/); // négation
  await expect(compteur).toHaveText('1 tâche restante');
});

test('assertions sur une collection et assertions "soft"', async ({ page }) => {
  await page.goto('/');
  for (const label of ['Une', 'Deux', 'Trois']) {
    await page.getByLabel('Nouvelle tâche').fill(label);
    await page.getByRole('button', { name: 'Ajouter' }).click();
  }

  await expect(page.getByTestId('todo-item')).toHaveCount(3);
  await expect(page.getByTestId('todo-label')).toHaveText(['Une', 'Deux', 'Trois']);

  // expect.soft : l'échec est enregistré mais le test continue (utile pour un "état des lieux")
  await expect.soft(page.getByTestId('todo-counter')).toHaveText('3 tâches restantes');
  await expect.soft(page.getByLabel('Nouvelle tâche')).toBeEmpty();
  await expect.soft(page.getByRole('button', { name: 'Ajouter' })).toBeEnabled();
});
