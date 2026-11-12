// @ts-check
// [J2] Fixtures personnalisées : on étend le `test` de Playwright pour injecter
// automatiquement des objets prêts à l'emploi dans chaque test.
//
//   import { test, expect } from '../../fixtures/todo-test.js';
//   test('...', async ({ todoPage }) => { ... });
//
import { test as base, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage.js';
import taches from '../data/taches.json' with { type: 'json' };

export const test = base.extend({
  // Fixture `todoPage` : un Page Object déjà positionné sur la page d'accueil.
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage); // <- le test s'exécute ici
    // (code après use() = nettoyage ; inutile ici : chaque test a sa propre session)
  },

  // Fixture `listeRemplie` : une liste déjà alimentée avec le jeu de données de référence.
  listeRemplie: async ({ todoPage }, use) => {
    for (const tache of taches) {
      await todoPage.add(tache.label, tache.priority);
    }
    await use(todoPage);
  },
});

export { expect, taches };
