// @ts-check
// JOUR 1 — Premiers scénarios d'exécution
// Structure d'un test : 1) naviguer  2) agir  3) vérifier (assertion)
import { test, expect } from '@playwright/test';

test('la page d\'accueil affiche le titre et le formulaire', { tag: '@smoke' }, async ({ page }) => {
  // 1. Naviguer : l'URL relative est complétée par baseURL (playwright.config.js)
  await page.goto('/');

  // 3. Vérifier : expect(...) attend jusqu'à 5 s que la condition soit vraie
  await expect(page).toHaveTitle(/Ma Todo List/);
  await expect(page.getByRole('heading', { name: 'Ma Todo List' })).toBeVisible();
  await expect(page.getByTestId('add-form')).toBeVisible();
});

test('une nouvelle session démarre avec une liste vide', async ({ page }) => {
  // Chaque test reçoit un navigateur "neuf" (browser context isolé : cookies vides)
  // donc une nouvelle session Symfony, donc aucune tâche. Pas besoin de nettoyer !
  await page.goto('/');

  await expect(page.getByTestId('empty-state')).toHaveText('Aucune tâche pour le moment');
  await expect(page.getByTestId('todo-counter')).toHaveText('0 tâche restante');
});
