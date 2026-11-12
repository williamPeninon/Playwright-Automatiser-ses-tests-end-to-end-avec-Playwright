# Automatiser ses tests end-to-end avec Playwright — projet fil rouge

Projet pédagogique de la formation **Playwright (2 jours)** : une application Symfony
volontairement simple (Todo List) et une suite de tests Playwright organisée par
jour et par chapitre du programme.

| Composant | Version |
|-----------|---------|
| Node.js | 24 LTS (Playwright exige Node.js ≥ 20) |
| @playwright/test | 1.64.1 (même version dans `playwright-tests/Dockerfile` et `.gitlab-ci.yml`) |
| Symfony / PHP | 7.4 / 8.4 (dans Docker) |

## Arborescence

```
.
├── docker-compose.yml          # app Symfony (+ service optionnel playwright)
├── .github/workflows/ci.yml    # CI GitHub Actions : smoke → matrice navigateurs → rapport fusionné
├── .gitlab-ci.yml              # CI GitLab : build image app → smoke → suite complète en 2 shards
├── symfony-app/                # application à tester
├── playwright-tests/
│   ├── playwright.config.js    # baseURL, 4 projects (chromium, firefox, webkit, mobile-chrome), rapports
│   ├── tests/jour1/            # 01 premiers pas · 02 localisateurs · 03 actions · 04 assertions · 05 synchronisation
│   ├── tests/jour2/            # 06 hooks/organisation · 07 données · 08 Page Object Model · 09 atelier diagnostic
│   ├── tests/mes-exercices/    # dossier de travail des stagiaires
│   ├── pages/TodoPage.js       # Page Object
│   ├── fixtures/todo-test.js   # fixtures personnalisées (todoPage, listeRemplie)
│   ├── data/taches.json        # jeu de données de test
│   └── solutions/              # corrigés des exercices (npm run test:solutions)
└── support-formation/
    └── GUIDE-STAGIAIRE.md      # tutoriel complet des 2 jours (version Markdown du support apprenant)
```

## Démarrage rapide

```bash
# 1. Démarrer l'application (http://localhost:8000) et attendre qu'elle réponde
docker compose up -d --wait app

# 2. Installer et lancer les tests (Node.js 24)
cd playwright-tests
npm ci
npx playwright install --with-deps
npm run test:chromium        # ou : npm test  (4 navigateurs/appareils)
npm run report
```

Sans Node.js, tout en Docker (comme en CI) :

```bash
docker compose up -d --wait app
CI=true docker compose run --rm playwright
```

## Scripts npm (dans `playwright-tests/`)

| Script | Effet |
|--------|-------|
| `npm test` | Toute la suite sur les 4 projets |
| `npm run test:chromium` | Toute la suite sur Chromium |
| `npm run test:jour1` / `test:jour2` | Démonstrations d'une journée |
| `npm run test:smoke` | Tests tagués `@smoke` |
| `npm run test:headed` / `test:ui` / `test:debug` | Modes visuels et interactifs |
| `npm run test:pedagogique` | Navigateur visible, ralenti (800 ms par action) |
| `npm run test:solutions` | Corrigés des exercices |
| `npm run codegen` | Enregistreur de tests sur la Todo List |
| `npm run report` | Dernier rapport HTML |

## L'application

Todo List sans base de données (stockage en session : chaque test Playwright a un
contexte de navigateur neuf, donc une liste vide). Fonctionnalités et notions associées :

| Fonctionnalité | Notion Playwright |
|----------------|-------------------|
| Ajout avec liste déroulante « Priorité » | `fill`, `selectOption`, `press`, `getByLabel` |
| Terminer / Réouvrir / Supprimer par ligne | mode strict, `filter`, chaînage |
| Compteur, `data-completed`, classe `is-done` | `toHaveText`, `toHaveAttribute`, `toHaveClass` |
| Filtres Toutes / Actives / Terminées | navigation, `toHaveURL` |
| Message temporaire (3 s) | `toBeVisible` puis `toBeHidden` |
| « Vider la liste » avec `confirm()` | `page.once('dialog')` |
| Statistiques AJAX (`/api/stats`, délai 0,5 à 2 s) | auto-waiting, `waitForResponse`, `page.route` |

## Points d'attention

- **Ne jamais utiliser `http://app:8000`** comme URL de test : « .app » est un domaine que
  les navigateurs forcent en HTTPS (HSTS préchargé). Le conteneur est joint par l'alias
  `todo-app` (`docker-compose.yml`, `.gitlab-ci.yml`).
- Garder **la même version de Playwright** dans `package.json`, `playwright-tests/Dockerfile`
  et `.gitlab-ci.yml`.
- Le serveur PHP intégré tourne avec `PHP_CLI_SERVER_WORKERS=8` pour supporter les tests
  parallèles ; il ne doit jamais être utilisé en production.
