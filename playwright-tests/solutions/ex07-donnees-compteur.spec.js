// @ts-check
// CORRIGÉ — Exercice 7 (J2) : test paramétré sur le pluriel du compteur
import { test, expect } from '../fixtures/todo-test.js';

const cas = [
  { nombre: 0, attendu: '0 tâche restante' },
  { nombre: 1, attendu: '1 tâche restante' },
  { nombre: 2, attendu: '2 tâches restantes' },
  { nombre: 3, attendu: '3 tâches restantes' },
];

for (const { nombre, attendu } of cas) {
  test(`avec ${nombre} tâche(s) le compteur affiche "${attendu}"`, async ({ todoPage }) => {
    for (let i = 1; i <= nombre; i++) {
      await todoPage.add(`Tâche ${i}`);
    }
    await expect(todoPage.counter).toHaveText(attendu);
  });
}
