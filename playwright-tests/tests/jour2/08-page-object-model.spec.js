// @ts-check
// JOUR 2 — Page Object Model + fixtures personnalisées
//
// Comparez avec tests/jour1/04-assertions.spec.js : même comportement testé,
// mais plus aucun locator dans le test. Il se lit comme un scénario métier.
import { test, expect, taches } from '../../fixtures/todo-test.js';

test('terminer puis réouvrir une tâche (version POM)', { tag: '@smoke' }, async ({ todoPage }) => {
  await todoPage.add('Préparer la démo', 'Haute');
  await expect(todoPage.counter).toHaveText('1 tâche restante');

  await todoPage.toggle('Préparer la démo');
  await expect(todoPage.item('Préparer la démo')).toHaveAttribute('data-completed', 'true');
  await expect(todoPage.counter).toHaveText('0 tâche restante');

  await todoPage.toggle('Préparer la démo');
  await expect(todoPage.counter).toHaveText('1 tâche restante');
});

test('supprimer une tâche d\'une liste déjà remplie', async ({ listeRemplie }) => {
  await listeRemplie.remove(taches[1].label);

  await expect(listeRemplie.items).toHaveCount(taches.length - 1);
  await expect(listeRemplie.toast).toHaveText('Tâche supprimée');
});

test('vider la liste après confirmation', async ({ listeRemplie }) => {
  await listeRemplie.clearAll();

  await expect(listeRemplie.counter).toHaveText('0 tâche restante');
});

test('les statistiques reflètent l\'état de la liste', async ({ listeRemplie, page }) => {
  await listeRemplie.toggle(taches[0].label);
  await page.reload();

  await expect(page.getByTestId('stats-total')).toHaveText(String(taches.length));
  await expect(page.getByTestId('stats-done')).toHaveText('1');
});
