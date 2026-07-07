# Importe les fonctions Playwright pour écrire et vérifier les tests
import re

from playwright.sync_api import Page, expect


# Regroupe les 3 scénarios sous un même bloc descriptif dans les rapports
class TestApplicationTodoListParcoursUtilisateur:
    """Application Todo List - parcours utilisateur"""

    # Scénario 1 : vérifie que la page d'accueil se charge correctement
    def test_scenario_1_la_page_d_accueil_se_charge_et_affiche_le_titre(self, page: Page):
        """Scénario 1 : la page d'accueil se charge et affiche le titre"""
        # Ouvre la page d'accueil (baseURL définie dans playwright.config.js)
        page.goto('/')

        # Vérifie que le titre principal affiche le texte attendu
        expect(page.get_by_test_id('page-title')).to_have_text('Ma Todo List')
        # Vérifie que le formulaire d'ajout est bien visible à l'écran
        expect(page.get_by_test_id('add-form')).to_be_visible()

    # Scénario 2 : simule l'ajout d'une tâche par un utilisateur
    def test_scenario_2_un_stagiaire_ajoute_une_nouvelle_tache(self, page: Page):
        """Scénario 2 : un stagiaire ajoute une nouvelle tâche"""
        # Ouvre la page d'accueil
        page.goto('/')

        # Saisit du texte dans le champ identifié par data-testid="todo-input"
        page.get_by_test_id('todo-input').fill('Réviser le Dockerfile')
        # Clique sur le bouton "Ajouter" identifié par data-testid="add-button"
        page.get_by_test_id('add-button').click()

        # Vérifie que la liste contient bien la tâche nouvellement ajoutée
        expect(page.get_by_test_id('todo-list')).to_contain_text('Réviser le Dockerfile')

    # Scénario 3 : simule la suppression d'une tâche existante
    def test_scenario_3_un_stagiaire_supprime_une_tache_existante(self, page: Page):
        """Scénario 3 : un stagiaire supprime une tâche existante"""
        # Ouvre la page d'accueil
        page.goto('/')

        # Prépare une tâche dédiée pour rendre ce test autonome (indépendant des autres)
        page.get_by_test_id('todo-input').fill('Tâche à supprimer')
        # Soumet le formulaire d'ajout
        page.get_by_test_id('add-button').click()
        # Confirme que la tâche apparaît bien dans la liste avant suppression
        expect(page.get_by_test_id('todo-list')).to_contain_text('Tâche à supprimer')

        # Clique sur le dernier bouton "Supprimer" de la page
        page.get_by_test_id('delete-button').last.click()

        # Vérifie que la tâche a bien disparu de la liste
        expect(page.get_by_test_id('todo-list')).not_to_contain_text('Tâche à supprimer')

    # Scénario 4 : simule le marquage d'une tâche comme terminée puis sa réouverture
    def test_scenario_4_un_stagiaire_marque_une_tache_comme_terminee(self, page: Page):
        """Scénario 4 : un stagiaire marque une tâche comme terminée"""
        # Ouvre la page d'accueil
        page.goto('/')

        # Ajoute une tâche dédiée pour rendre ce test autonome
        page.get_by_test_id('todo-input').fill('Tâche à terminer')
        # Soumet le formulaire d'ajout
        page.get_by_test_id('add-button').click()
        # Vérifie que le compteur affiche 1 tâche restante
        expect(page.get_by_test_id('todo-counter')).to_have_text('1 tâche restante')

        # Cible la ligne de la tâche créée et clique sur "Terminer"
        todo_item = page.get_by_test_id('todo-item').filter(has_text='Tâche à terminer')
        todo_item.get_by_test_id('toggle-button').click()

        # Vérifie que la tâche est marquée comme terminée (attribut data-completed)
        expect(todo_item).to_have_attribute('data-completed', 'true')
        # Vérifie que le libellé est barré visuellement (classe CSS is-done)
        expect(todo_item.get_by_test_id('todo-label')).to_have_class(re.compile(r'is-done'))
        # Vérifie que le compteur indique 0 tâche restante
        expect(page.get_by_test_id('todo-counter')).to_have_text('0 tâche restante')

        # Clique sur "Réouvrir" pour remettre la tâche en cours
        todo_item.get_by_test_id('toggle-button').click()

        # Vérifie que la tâche n'est plus marquée terminée
        expect(todo_item).not_to_have_attribute('data-completed', 'true')
        # Vérifie que le compteur repasse à 1 tâche restante
        expect(page.get_by_test_id('todo-counter')).to_have_text('1 tâche restante')
