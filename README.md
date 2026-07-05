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

## Prérequis

### Outils à installer

| Outil | Obligatoire pour | Installation |
|-------|------------------|--------------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Lancer l'app Symfony et les tests en conteneur | macOS / Windows / Linux |
| [Docker Compose](https://docs.docker.com/compose/) | Orchestrer les services (`app` + `playwright`) | Inclus avec Docker Desktop |
| [Node.js](https://nodejs.org/) (v18 ou plus) | Voir l'automation en direct (`npm run test:pedagogique`) | Optionnel si Docker suffit |
| [Git](https://git-scm.com/) | Cloner le dépôt | Recommandé |

Connexion internet requise lors du premier build (téléchargement des dépendances
Composer et npm).

### Vérifier l'installation

```bash
docker --version
docker compose version
node --version    # optionnel, pour les tests locaux avec fenêtre visible
npm --version     # optionnel, pour les tests locaux avec fenêtre visible
```

## Démarrage rapide

```bash
# 1. Cloner le projet (si besoin)
git clone <url-du-depot>
cd projet-symfony-playwrite

# 2. Construire les images Docker
docker compose build

# 3. Lancer l'application Symfony (en arrière-plan)
docker compose up -d app
# -> disponible sur http://localhost:8000

# 4. Lancer les tests Playwright en mode headless (CI / validation)
docker compose run --rm playwright

# 5. Consulter le rapport HTML
npx playwright show-report playwright-tests/playwright-report
```

## Voir l'automation en direct (approche pédagogique)

Les tests Docker s'exécutent en mode headless (sans fenêtre visible). Pour
**montrer l'automation** aux stagiaires, lancez les tests en local avec
l'application Symfony déjà démarrée (`docker compose up -d app`) :

```bash
cd playwright-tests
npm install
npx playwright install chromium   # une seule fois, au premier lancement
npm run test:pedagogique
```

Ce script ouvre une fenêtre Chromium, exécute les scénarios **un par un**
(`--workers=1`) et ralentit chaque action de 800 ms (`slowMo`) pour faciliter
le suivi visuel.

### Commandes Playwright utiles

| Commande | Où l'exécuter | Usage |
|----------|---------------|-------|
| `docker compose run --rm playwright` | Racine du projet | Tests headless via Docker |
| `npm run test:headed` | `playwright-tests/` | Voir le navigateur, vitesse normale |
| `npm run test:pedagogique` | `playwright-tests/` | Voir le navigateur, ralenti et séquentiel |
| `npx playwright test --ui` | `playwright-tests/` | Mode interactif pas-à-pas |
| `npm run report` | `playwright-tests/` | Ouvrir le rapport HTML |
| `npx playwright show-report playwright-tests/playwright-report` | Racine du projet | Ouvrir le rapport depuis la racine |

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

## Intégration continue (GitHub Actions)

À chaque push ou pull request sur la branche `main`, la CI exécute
automatiquement les tests E2E Playwright via Docker Compose.

Workflow : `.github/workflows/ci.yml`

Étapes exécutées :
1. Construction des images Docker (`app` Symfony + `playwright`)
2. Démarrage de l'application Symfony
3. Attente de disponibilité sur `http://localhost:8000`
4. Lancement des 3 scénarios Playwright en mode headless
5. Publication du rapport HTML en artefact GitHub (onglet **Actions**)

Pour consulter le rapport après une CI :
1. Ouvrir l'onglet **Actions** du dépôt GitHub
2. Cliquer sur l'exécution souhaitée
3. Télécharger l'artefact **`playwright-report`**
4. Décompresser le zip et ouvrir `index.html` dans un navigateur

En CI, Playwright active automatiquement `forbidOnly` et 1 retry en cas
d'échec (voir `playwright.config.js`).

Reproduire la CI en local :

```bash
CI=true docker compose build
docker compose up -d app
# attendre que http://localhost:8000 réponde
CI=true docker compose run --rm playwright
docker compose down -v
```
