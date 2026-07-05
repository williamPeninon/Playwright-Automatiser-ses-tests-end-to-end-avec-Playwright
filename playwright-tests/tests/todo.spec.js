// Active la vérification de types TypeScript dans l'éditeur (sans compiler le fichier)
// @ts-check
// Importe les fonctions Playwright pour écrire et vérifier les tests
const { test, expect } = require('@playwright/test');

// Regroupe les 3 scénarios sous un même bloc descriptif dans les rapports
test.describe('Application Todo List - parcours utilisateur', () => {

  // Scénario 1 : vérifie que la page d'accueil se charge correctement
  test('Scénario 1 : la page d\'accueil se charge et affiche le titre', async ({ page }) => {
    // Ouvre la page d'accueil (baseURL définie dans playwright.config.js)
    await page.goto('/');

    // Vérifie que le titre principal affiche le texte attendu
    await expect(page.getByTestId('page-title')).toHaveText('Ma Todo List');
    // Vérifie que le formulaire d'ajout est bien visible à l'écran
    await expect(page.getByTestId('add-form')).toBeVisible();
  });

  // Scénario 2 : simule l'ajout d'une tâche par un utilisateur
  test('Scénario 2 : un stagiaire ajoute une nouvelle tâche', async ({ page }) => {
    // Ouvre la page d'accueil
    await page.goto('/');

    // Saisit du texte dans le champ identifié par data-testid="todo-input"
    await page.getByTestId('todo-input').fill('Réviser le Dockerfile');
    // Clique sur le bouton "Ajouter" identifié par data-testid="add-button"
    await page.getByTestId('add-button').click();

    // Vérifie que la liste contient bien la tâche nouvellement ajoutée
    await expect(page.getByTestId('todo-list')).toContainText('Réviser le Dockerfile');
  });

  // Scénario 3 : simule la suppression d'une tâche existante
  test('Scénario 3 : un stagiaire supprime une tâche existante', async ({ page }) => {
    // Ouvre la page d'accueil
    await page.goto('/');

    // Prépare une tâche dédiée pour rendre ce test autonome (indépendant des autres)
    await page.getByTestId('todo-input').fill('Tâche à supprimer');
    // Soumet le formulaire d'ajout
    await page.getByTestId('add-button').click();
    // Confirme que la tâche apparaît bien dans la liste avant suppression
    await expect(page.getByTestId('todo-list')).toContainText('Tâche à supprimer');

    // Clique sur le dernier bouton "Supprimer" de la page
    await page.getByTestId('delete-button').last().click();

    // Vérifie que la tâche a bien disparu de la liste
    await expect(page.getByTestId('todo-list')).not.toContainText('Tâche à supprimer');
  });

});
