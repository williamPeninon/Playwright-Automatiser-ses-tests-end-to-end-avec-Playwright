// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Application Todo List - parcours utilisateur', () => {

  test('Scénario 1 : la page d\'accueil se charge et affiche le titre', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('page-title')).toHaveText('Ma Todo List');
    await expect(page.getByTestId('add-form')).toBeVisible();
  });

  test('Scénario 2 : un stagiaire ajoute une nouvelle tâche', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('todo-input').fill('Réviser le Dockerfile');
    await page.getByTestId('add-button').click();

    await expect(page.getByTestId('todo-list')).toContainText('Réviser le Dockerfile');
  });

  test('Scénario 3 : un stagiaire supprime une tâche existante', async ({ page }) => {
    await page.goto('/');

    // On crée une tâche dédiée pour ne pas dépendre d'un autre test
    await page.getByTestId('todo-input').fill('Tâche à supprimer');
    await page.getByTestId('add-button').click();
    await expect(page.getByTestId('todo-list')).toContainText('Tâche à supprimer');

    // On supprime la dernière tâche ajoutée
    await page.getByTestId('delete-button').last().click();

    await expect(page.getByTestId('todo-list')).not.toContainText('Tâche à supprimer');
  });

});
