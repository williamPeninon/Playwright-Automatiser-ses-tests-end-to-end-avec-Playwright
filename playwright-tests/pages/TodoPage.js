// @ts-check
// [J2] Page Object Model : toute la connaissance de la page Todo List est ici.
// Les tests décrivent le "quoi" (ajouter, terminer...), le Page Object sait le "comment"
// (quels locators, quel ordre de clics). Si le HTML change, on ne corrige qu'ici.
import { expect } from '@playwright/test';

export class TodoPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;

    // Locators déclarés une seule fois, par ordre de préférence :
    // rôle accessible > label > texte > data-testid
    this.title = page.getByRole('heading', { level: 1 });
    this.input = page.getByLabel('Nouvelle tâche');
    this.priority = page.getByLabel('Priorité');
    this.addButton = page.getByRole('button', { name: 'Ajouter' });
    this.list = page.getByRole('list', { name: 'Liste des tâches' });
    this.items = page.getByTestId('todo-item');
    this.emptyState = page.getByTestId('empty-state');
    this.counter = page.getByTestId('todo-counter');
    this.toast = page.getByRole('status');
    this.clearButton = page.getByRole('button', { name: 'Vider la liste' });
    this.filters = page.getByRole('navigation', { name: 'Filtres' });
  }

  /** @param {'all'|'active'|'done'} [filter] */
  async goto(filter) {
    await this.page.goto(filter && filter !== 'all' ? `/?filter=${filter}` : '/');
  }

  /** Ligne de la liste dont le libellé est exactement `label`. */
  item(label) {
    return this.items.filter({ has: this.page.getByText(label, { exact: true }) });
  }

  /**
   * Ajoute une tâche et attend qu'elle apparaisse.
   * @param {string} label
   * @param {'Basse'|'Normale'|'Haute'} [priority]
   */
  async add(label, priority = 'Normale') {
    await this.input.fill(label);
    await this.priority.selectOption({ label: priority });
    await this.addButton.click();
    await expect(this.item(label)).toBeVisible();
  }

  async toggle(label) {
    await this.item(label).getByRole('button', { name: /Terminer|Réouvrir/ }).click();
  }

  async remove(label) {
    await this.item(label).getByRole('button', { name: 'Supprimer' }).click();
    await expect(this.item(label)).toHaveCount(0);
  }

  /** @param {'Toutes'|'Actives'|'Terminées'} name */
  async filterBy(name) {
    await this.filters.getByRole('link', { name }).click();
  }

  /** Vide la liste en acceptant la boîte de confirmation. */
  async clearAll() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.clearButton.click();
    await expect(this.emptyState).toBeVisible();
  }
}
