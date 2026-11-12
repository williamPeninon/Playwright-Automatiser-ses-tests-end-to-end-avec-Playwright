// @ts-check
// JOUR 1 — Synchronisation, attentes automatiques et composants dynamiques
//
// Règle d'or : JAMAIS de page.waitForTimeout(…) "pour être sûr".
// Les actions (click, fill…) et les assertions web-first (expect(locator)…)
// attendent automatiquement que l'élément soit prêt.
import { test, expect } from '@playwright/test';

test('les statistiques chargées en AJAX finissent par s\'afficher (auto-attente)', async ({ page }) => {
  await page.goto('/');

  // Le serveur répond en 0,5 à 2 s : l'assertion réessaie jusqu'à 5 s
  await expect(page.getByTestId('stats-loading')).toBeVisible();
  await expect(page.getByTestId('stats-total')).toHaveText('0');
  await expect(page.getByTestId('stats-loading')).toBeHidden();
});

test('attendre explicitement une réponse réseau (waitForResponse)', async ({ page }) => {
  // On "arme" l'attente AVANT l'action qui déclenche la requête
  const reponseStats = page.waitForResponse('**/api/stats');
  await page.goto('/');
  const reponse = await reponseStats;

  expect(reponse.status()).toBe(200);
  expect(await reponse.json()).toEqual({ total: 0, done: 0, remaining: 0 });
});

test('le message de confirmation apparaît puis disparaît tout seul', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Tâche éphémère');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const toast = page.getByRole('status');
  await expect(toast).toHaveText('Tâche « Tâche éphémère » ajoutée');
  await expect(toast).toBeHidden(); // retiré par JavaScript après 3 s
});

test('accepter ou refuser une boîte de dialogue native (confirm)', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Tâche à conserver');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  // 1er essai : on refuse -> rien n'est supprimé
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Vider la liste' }).click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1);

  // 2e essai : on accepte et on vérifie le message affiché
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('Supprimer toutes les tâches ?');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Vider la liste' }).click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test.describe('simuler le back-end avec page.route (mock réseau)', () => {
  test('données simulées', async ({ page }) => {
    await page.route('**/api/stats', (route) =>
      route.fulfill({ json: { total: 42, done: 40, remaining: 2 } }),
    );
    await page.goto('/');
    await expect(page.getByTestId('stats-total')).toHaveText('42');
  });

  test('panne du serveur : un message d\'erreur s\'affiche', async ({ page }) => {
    await page.route('**/api/stats', (route) => route.fulfill({ status: 500 }));
    await page.goto('/');
    await expect(page.getByRole('alert')).toHaveText('Statistiques indisponibles');
  });
});
