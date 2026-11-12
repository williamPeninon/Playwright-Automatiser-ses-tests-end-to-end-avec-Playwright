// @ts-check
// JOUR 2 — Données de test : tests paramétrés (data-driven) et fichier JSON externe
import { test, expect } from '@playwright/test';
import taches from '../../data/taches.json' with { type: 'json' };

// Un test généré par priorité : 3 tests distincts dans le rapport
const priorites = [
  { label: 'Basse', value: 'basse' },
  { label: 'Normale', value: 'normale' },
  { label: 'Haute', value: 'haute' },
];

for (const priorite of priorites) {
  test(`une tâche de priorité ${priorite.label} affiche le bon badge`, async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nouvelle tâche').fill(`Tâche ${priorite.label}`);
    await page.getByLabel('Priorité').selectOption(priorite.value);
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByTestId('todo-priority')).toHaveText(priorite.label);
  });
}

test('le jeu de données de référence est affiché dans l\'ordre de saisie', async ({ page }) => {
  await page.goto('/');
  for (const tache of taches) {
    await page.getByLabel('Nouvelle tâche').fill(tache.label);
    await page.getByLabel('Priorité').selectOption({ label: tache.priority });
    await page.getByRole('button', { name: 'Ajouter' }).click();
  }

  await expect(page.getByTestId('todo-label')).toHaveText(taches.map((t) => t.label));
  await expect(page.getByTestId('todo-counter')).toHaveText(`${taches.length} tâches restantes`);
});

test('les espaces autour du libellé sont supprimés et une saisie vide est refusée', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('   Tâche avec espaces   ');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page.getByTestId('todo-label')).toHaveText('Tâche avec espaces');

  // Champ vide : l'attribut HTML "required" bloque l'envoi du formulaire
  await page.getByLabel('Nouvelle tâche').fill('');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);
});
