// @ts-check
// CORRIGÉ — Exercice 6 (J2) : utiliser le Page Object et les fixtures pour tester les filtres
import { test, expect, taches } from '../fixtures/todo-test.js';

test('filtrer une liste remplie (POM + fixture)', async ({ listeRemplie }) => {
  await listeRemplie.toggle(taches[0].label);

  await listeRemplie.filterBy('Terminées');
  await expect(listeRemplie.items).toHaveCount(1);
  await expect(listeRemplie.item(taches[0].label)).toBeVisible();

  await listeRemplie.filterBy('Actives');
  await expect(listeRemplie.items).toHaveCount(taches.length - 1);
});
