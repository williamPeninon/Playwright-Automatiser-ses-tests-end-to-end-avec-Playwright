// @ts-check
// CORRIGÉ — Exercice 3 (J1) : écrire le test de la user story "terminer / réouvrir"
import { test, expect } from '@playwright/test';

test('terminer puis réouvrir une tâche', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Rédiger le compte rendu');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const ligne = page.getByTestId('todo-item').filter({ hasText: 'Rédiger le compte rendu' });
  const compteur = page.getByTestId('todo-counter');
  await expect(compteur).toHaveText('1 tâche restante');

  await ligne.getByRole('button', { name: 'Terminer' }).click();
  await expect(ligne).toHaveAttribute('data-completed', 'true');
  await expect(ligne.getByTestId('todo-label')).toHaveClass(/is-done/);
  await expect(compteur).toHaveText('0 tâche restante');

  await ligne.getByRole('button', { name: 'Réouvrir' }).click();
  await expect(ligne).toHaveAttribute('data-completed', 'false');
  await expect(compteur).toHaveText('1 tâche restante');
});
