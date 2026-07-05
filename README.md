# Formation Symfony & Playwright

Projet pédagogique clé en main pour une séance de formation sur les tests end-to-end
avec Playwright, appliqués à une application Symfony minimaliste.

## Contenu de l'archive

```
formation-symfony-playwright/
├── docker-compose.yml          # Orchestration app Symfony + tests Playwright
├── symfony-app/                # Application Symfony (Todo List) à tester
├── playwright-tests/           # Scénarios de tests Playwright (3 scénarios)
└── support-formation/
    └── GUIDE-STAGIAIRE.md      # Support tutoriel pas-à-pas pour les stagiaires
```

## Démarrage rapide

Pré-requis : Docker et Docker Compose installés, connexion internet (pour le
téléchargement des dépendances Composer et npm lors du build).

```bash
# 1. Construire les images
docker compose build

# 2. Lancer l'application Symfony seule (en arrière-plan)
docker compose up -d app
# -> disponible sur http://localhost:8000

# 3. Lancer les tests Playwright contre l'application
docker compose run --rm playwright
```

Le rapport HTML des tests est généré dans `playwright-tests/playwright-report/`
(ouvrir `index.html` dans un navigateur).

## Application de démonstration

Une simple "Todo List" en Symfony, sans base de données (stockage en session),
pour rester légère et focaliser la séance sur Playwright plutôt que sur la
configuration de l'application :

- Affichage de la liste des tâches
- Ajout d'une tâche
- Suppression d'une tâche

Tous les éléments clés de la page portent un attribut `data-testid`, pratique
courante pour écrire des sélecteurs Playwright robustes.

## Scénarios de tests Playwright fournis

| # | Scénario | Fichier |
|---|----------|---------|
| 1 | Chargement de la page d'accueil et affichage du titre | `playwright-tests/tests/todo.spec.js` |
| 2 | Ajout d'une nouvelle tâche | `playwright-tests/tests/todo.spec.js` |
| 3 | Suppression d'une tâche existante | `playwright-tests/tests/todo.spec.js` |

Pour les stagiaires, voir le guide pas-à-pas : `support-formation/GUIDE-STAGIAIRE.md`.
