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

  // Scénario 4 : simule le marquage d'une tâche comme terminée puis sa réouverture
  test('Scénario 4 : un stagiaire marque une tâche comme terminée', async ({ page }) => {
    // Ouvre la page d'accueil
    await page.goto('/');

    // Ajoute une tâche dédiée pour rendre ce test autonome
    await page.getByTestId('todo-input').fill('Tâche à terminer');
    // Soumet le formulaire d'ajout
    await page.getByTestId('add-button').click();
    // Vérifie que le compteur affiche 1 tâche restante
    await expect(page.getByTestId('todo-counter')).toHaveText('1 tâche restante');

    // Cible la ligne de la tâche créée et clique sur "Terminer"
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Tâche à terminer' });
    await todoItem.getByTestId('toggle-button').click();

    // Vérifie que la tâche est marquée comme terminée (attribut data-completed)
    await expect(todoItem).toHaveAttribute('data-completed', 'true');
    // Vérifie que le libellé est barré visuellement (classe CSS is-done)
    await expect(todoItem.getByTestId('todo-label')).toHaveClass(/is-done/);
    // Vérifie que le compteur indique 0 tâche restante
    await expect(page.getByTestId('todo-counter')).toHaveText('0 tâche restante');

    // Clique sur "Réouvrir" pour remettre la tâche en cours
    await todoItem.getByTestId('toggle-button').click();

    // Vérifie que la tâche n'est plus marquée terminée
    await expect(todoItem).not.toHaveAttribute('data-completed', 'true');
    // Vérifie que le compteur repasse à 1 tâche restante
    await expect(page.getByTestId('todo-counter')).toHaveText('1 tâche restante');
  });

});
