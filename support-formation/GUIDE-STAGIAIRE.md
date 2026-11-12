# Automatiser ses tests end-to-end avec Playwright — Guide stagiaire

> Support apprenant — tutoriel pas à pas, exercices et corrigés. Durée : 2 jours (14 h) · Public : développeurs, testeurs, profils DevOps (alternance) · Prérequis : bases de JavaScript, de la ligne de commande et de Git · Versions : Node.js 24 LTS, Playwright 1.64, Symfony 7.4, Docker


---

## Avant de commencer

### Objectifs de la formation

À l'issue des deux jours, vous serez capable de :

1. comprendre les principes des tests automatisés end-to-end et le positionnement de Playwright ;
2. installer et configurer un environnement de test Playwright avec Node.js ;
3. écrire des scénarios de test fiables à l'aide de sélecteurs, d'actions et d'assertions ;
4. gérer la synchronisation, les attentes et les éléments dynamiques dans une interface web ;
5. structurer une suite de tests avec les bonnes pratiques de maintenance et de réutilisation ;
6. exploiter le reporting, le debugging et l'exécution multi-navigateurs ;
7. intégrer Playwright dans une chaîne d'intégration continue.

### Programme et plan de ce support

| Moment | Module | Exercice |
|---|---|---|
| J1 matin | 1. Panorama des tests et positionnement de Playwright | — |
| J1 matin | 2. Installer Node.js et Playwright, initialiser un projet | TP 0 |
| J1 matin | 3. Projet fil rouge, runner Playwright Test et premier scénario | Ex. 1 |
| J1 après-midi | 4. Localisateurs et bonnes pratiques de sélection | Ex. 2 |
| J1 après-midi | 5. Actions utilisateur et assertions | Ex. 3 |
| J1 après-midi | 6. Synchronisation, attentes et composants dynamiques | Ex. 4 |
| J2 matin | 7. Organiser une suite : fichiers, nommage, hooks, tags | Ex. 5 |
| J2 matin | 8. Fixtures, données de test et Page Object Model | Ex. 6 et 7 |
| J2 matin | 9. Faire évoluer une base de tests dans le temps | — |
| J2 après-midi | 10. Multi-navigateurs et parallélisation | TP guidé |
| J2 après-midi | 11. Rapports, traces, debugging et diagnostic des échecs | Ex. 8 |
| J2 après-midi | 12. Intégration continue : GitHub Actions et GitLab CI | Ex. 9 |

> ℹ️ **À savoir :** chaque module se termine par une checklist. Ne passez à la suite que lorsque tous les points sont cochés. Les corrigés des exercices sont regroupés en annexe : essayez d'abord !

### Le projet fil rouge

Tout au long de la formation, vous testez une petite application **Todo List** développée avec Symfony. Elle est volontairement simple côté métier, mais contient tout ce qu'il faut pour pratiquer : formulaire avec liste déroulante, filtres (navigation), bascule d'état, compteur, message temporaire, boîte de confirmation et statistiques chargées en AJAX avec un délai variable.

```text
projet-symfony-playwright/
├── docker-compose.yml          # lance l'application (et, en option, les tests)
├── .github/workflows/ci.yml    # pipeline GitHub Actions (module 12)
├── .gitlab-ci.yml              # pipeline GitLab CI (module 12)
├── symfony-app/                # l'application à tester (PHP / Symfony 7.4)
└── playwright-tests/           # le projet de tests (Node.js / Playwright)
    ├── playwright.config.js    # configuration : baseURL, navigateurs, rapports
    ├── tests/jour1/            # démonstrations du jour 1 (modules 3 à 6)
    ├── tests/jour2/            # démonstrations du jour 2 (modules 7 à 11)
    ├── tests/mes-exercices/    # VOS exercices
    ├── pages/TodoPage.js       # Page Object (module 8)
    ├── fixtures/todo-test.js   # fixtures personnalisées (module 8)
    ├── data/taches.json        # données de test (module 8)
    └── solutions/              # corrigés (à n'ouvrir qu'après avoir cherché)
```

> 📌 **À retenir :** l'application et les tests sont deux projets séparés qui ne communiquent que par HTTP, exactement comme en entreprise : Playwright ne connaît pas le PHP, il pilote un navigateur.


---

## Module 1 — Panorama des tests automatisés

### Unitaires, intégration, end-to-end

| Niveau | Ce qui est testé | Vitesse | Exemple sur la Todo List |
|---|---|---|---|
| Unitaire | Une classe ou une fonction isolée | millisecondes | `TodoStorage::add()` attribue le bon identifiant (PHPUnit) |
| Intégration | Plusieurs composants ensemble (contrôleur + session, API…) | dixièmes de seconde | `POST /add` redirige et stocke la tâche (WebTestCase) |
| End-to-end (E2E) | Un parcours utilisateur complet, dans un vrai navigateur | secondes | Saisir une tâche, cliquer « Ajouter », la voir apparaître |

La **pyramide des tests** recommande beaucoup de tests unitaires, moins de tests d'intégration et un nombre limité de tests E2E, ciblés sur les parcours critiques. Les tests E2E sont les plus lents, les plus coûteux à maintenir et les plus exposés à l'**instabilité** (tests « flaky »). Mais ce sont les seuls qui valident ce que l'utilisateur voit réellement : HTML, CSS, JavaScript, serveur et navigateur réunis.

> ⚠️ **Attention :** le projet fil rouge ne contient que des tests E2E : c'est le sujet de la formation. Dans un vrai projet, ils complètent des tests unitaires et d'intégration, ils ne les remplacent pas.

### Positionnement de Playwright

| Critère | Playwright | Cypress | Selenium WebDriver | Symfony Panther / Behat |
|---|---|---|---|---|
| Langages | JS/TS, Python, Java, .NET | JS/TS | Tous les langages courants | PHP (+ Gherkin pour Behat) |
| Navigateurs | Chromium, Firefox, WebKit | Chrome, Edge, Firefox (WebKit expérimental) | Tous via drivers | Chrome, Firefox (via WebDriver) |
| Architecture | Pilote le navigateur depuis l'extérieur (protocole) | S'exécute dans le navigateur | Protocole WebDriver (W3C) | WebDriver |
| Attente automatique | Oui (actions et assertions) | Oui | Non (attentes explicites) | Partielle |
| Multi-onglets / domaines | Oui | Limité | Oui | Oui |
| Outillage inclus | Runner, rapports, traces, codegen, UI mode | Runner, UI interactive | Aucun (à assembler) | PHPUnit / Behat |

Playwright est retenu ici parce qu'il est indépendant du langage du back-end, qu'il couvre les trois moteurs de rendu (dont WebKit, le moteur de Safari), et qu'il fournit en standard tout ce dont une équipe a besoin : runner parallèle, rapports, traces, enregistreur de tests et image Docker officielle.

- [ ] Je sais situer un test E2E par rapport aux tests unitaires et d'intégration.
- [ ] Je peux citer deux avantages et deux limites des tests E2E.
- [ ] Je sais expliquer pourquoi Playwright est adapté à une application PHP.


---

## Module 2 — Installer Node.js et Playwright

### 2.1 Vérifier l'environnement

Sur la VM de formation (Ubuntu), tout est préinstallé. Sur votre poste, installez **Node.js 24 LTS** (nodejs.org ou `nvm install 24`), **Git**, **Docker** (Docker Desktop sous Windows/macOS, Docker Engine + plugin Compose sous Linux) et **VS Code** avec l'extension *Playwright Test for VS Code*.

```bash
node --version          # v24.x attendu (Playwright exige Node.js 20 ou plus)
npm --version
git --version
docker --version
docker compose version
```

### 2.2 TP 0 — Initialiser un projet Playwright vierge

Avant d'ouvrir le projet fil rouge, créez un projet de découverte pour voir ce que Playwright génère :

```bash
mkdir ~/decouverte-playwright && cd ~/decouverte-playwright
npm init playwright@latest
```

Répondez aux questions : **JavaScript**, dossier `tests`, **pas** de workflow GitHub Actions (nous l'écrirons au module 12), **oui** à l'installation des navigateurs.

| Fichier / dossier généré | Rôle |
|---|---|
| `package.json` | Dépendance `@playwright/test` (le runner + la bibliothèque) |
| `playwright.config.js` | Configuration : dossier des tests, navigateurs (projects), rapports, options `use` |
| `tests/example.spec.js` | Deux tests d'exemple sur playwright.dev |
| `node_modules/` | Dépendances installées (jamais versionnées) |
| Cache des navigateurs | Chromium, Firefox et WebKit téléchargés dans `~/.cache/ms-playwright` |

```bash
npx playwright test                 # lance les tests, 3 navigateurs, mode headless
npx playwright show-report          # ouvre le rapport HTML
npx playwright test --ui            # mode UI : exécuter, rejouer, inspecter pas à pas
```

> 💡 **Astuce :** sous Linux, si un navigateur refuse de démarrer, installez ses dépendances système : `sudo npx playwright install-deps` (ou `npx playwright install --with-deps`).

- [ ] `node --version` affiche une version 24.x.
- [ ] J'ai généré un projet avec `npm init playwright@latest` et exécuté les tests d'exemple.
- [ ] J'ai ouvert le rapport HTML et le mode UI.


---

## Module 3 — Projet fil rouge et runner Playwright Test

### 3.1 Récupérer le projet et démarrer l'application

```bash
git clone <URL fournie par le formateur> projet-symfony-playwright
cd projet-symfony-playwright
git switch formation-2-jours
docker compose up -d --wait app      # construit l'image et attend que l'app réponde
```

Ouvrez http://localhost:8000. Manipulez l'application à la main : ajoutez deux tâches avec des priorités différentes, terminez-en une, utilisez les filtres, videz la liste. Observez le message vert qui disparaît et les statistiques qui arrivent avec un temps de retard : ce sont les cas que vous automatiserez.

> ℹ️ **À savoir :** le premier `docker compose up` télécharge l'image PHP et les dépendances Composer (quelques minutes). Si le port 8000 est occupé, changez le mapping dans `docker-compose.yml` (`"8080:8000"`) et lancez les tests avec `PLAYWRIGHT_BASE_URL=http://localhost:8080`.

### 3.2 Installer et lancer la suite de tests

```bash
cd playwright-tests
npm ci                                # installe la version exacte de package-lock.json
npx playwright install --with-deps    # navigateurs + dépendances système
npm run test:chromium                 # toute la suite, sur Chromium uniquement
```

Résultat attendu : tous les tests sont verts, sauf quelques tests marqués *skipped* (volontairement ignorés : atelier du module 11 et fonctionnalité non développée).

### 3.3 Les options du runner à connaître

| Commande | Effet |
|---|---|
| `npx playwright test tests/jour1` | Ne lance que les fichiers d'un dossier (ou d'un fichier) |
| `npx playwright test -g "filtre"` | Ne lance que les tests dont le titre contient le texte |
| `npx playwright test --grep @smoke` | Ne lance que les tests portant le tag `@smoke` |
| `npx playwright test --project=firefox` | Choisit le navigateur (projet défini dans la config) |
| `npx playwright test --headed` | Affiche le navigateur |
| `npm run test:pedagogique` | Navigateur visible, ralenti de 800 ms par action, un test à la fois |
| `npx playwright test --ui` | Mode UI : liste des tests, chronologie, DOM à chaque étape, mode watch |
| `npx playwright test --debug` | Ouvre l'inspecteur et exécute pas à pas |
| `npx playwright test --last-failed` | Relance uniquement les tests en échec au dernier passage |
| `npx playwright test --repeat-each=5` | Répète chaque test : idéal pour détecter un test instable |
| `npx playwright test --workers=1` | Désactive le parallélisme |
| `npx playwright codegen http://localhost:8000` | Enregistre vos clics et génère le code du test |
| `npx playwright show-report` | Ouvre le dernier rapport HTML |

### 3.4 Anatomie d'un test

Ouvrez `tests/jour1/01-premiers-pas.spec.js` :

```javascript
// @ts-check
// JOUR 1 — Premiers scénarios d'exécution
// Structure d'un test : 1) naviguer  2) agir  3) vérifier (assertion)
import { test, expect } from '@playwright/test';

test('la page d\'accueil affiche le titre et le formulaire', { tag: '@smoke' }, async ({ page }) => {
  // 1. Naviguer : l'URL relative est complétée par baseURL (playwright.config.js)
  await page.goto('/');

  // 3. Vérifier : expect(...) attend jusqu'à 5 s que la condition soit vraie
  await expect(page).toHaveTitle(/Ma Todo List/);
  await expect(page.getByRole('heading', { name: 'Ma Todo List' })).toBeVisible();
  await expect(page.getByTestId('add-form')).toBeVisible();
});

test('une nouvelle session démarre avec une liste vide', async ({ page }) => {
  // Chaque test reçoit un navigateur "neuf" (browser context isolé : cookies vides)
  // donc une nouvelle session Symfony, donc aucune tâche. Pas besoin de nettoyer !
  await page.goto('/');

  await expect(page.getByTestId('empty-state')).toHaveText('Aucune tâche pour le moment');
  await expect(page.getByTestId('todo-counter')).toHaveText('0 tâche restante');
});
```

- `test(titre, async ({ page }) => { … })` déclare un test ; `page` est une **fixture** fournie par Playwright (un onglet neuf).
- `await` est obligatoire devant chaque action et chaque assertion : tout est asynchrone.
- `page.goto('/')` utilise la `baseURL` de `playwright.config.js` (http://localhost:8000).
- Chaque test s'exécute dans un **contexte de navigateur isolé** (cookies vides) : il démarre donc avec une nouvelle session Symfony et une liste vide.

### Exercice 1 — Votre premier scénario

Créez `tests/mes-exercices/ex01-liste-vide.spec.js` contenant deux tests :

1. à l'ouverture, la liste affiche « Aucune tâche pour le moment » (`data-testid="empty-state"`) ;
2. après l'ajout d'une tâche, ce message disparaît, puis il réapparaît quand on supprime la tâche.

```bash
npx playwright test mes-exercices/ex01 --project=chromium --headed
```

Corrigé : annexe A.1.

- [ ] L'application tourne sur http://localhost:8000.
- [ ] La suite fournie passe sur Chromium.
- [ ] Je sais filtrer les tests par fichier, titre, tag et navigateur.
- [ ] Mon exercice 1 passe.


---

## Module 4 — Localisateurs et bonnes pratiques de sélection

Un **localisateur** (`Locator`) décrit *comment trouver* un élément. Il est évalué au moment de l'action, et réévalué à chaque tentative : il ne « périme » jamais, même si la page est rechargée.

| Priorité | Méthode | Exemple sur la Todo List |
|---|---|---|
| 1 | `getByRole(rôle, { name })` | `page.getByRole('button', { name: 'Ajouter' })` |
| 2 | `getByLabel(texte)` | `page.getByLabel('Priorité')` |
| 2 | `getByPlaceholder` / `getByText` | `page.getByText('Aucune tâche pour le moment')` |
| 3 | `getByTestId(id)` | `page.getByTestId('todo-counter')` |
| 4 | `locator('css')` ou XPath | `page.locator('#todo-input')` — dernier recours |

Les localisateurs par **rôle** et par **label** reflètent ce que perçoivent l'utilisateur et les technologies d'assistance : un test qui les utilise vérifie aussi l'accessibilité de la page. Le `data-testid` est un contrat explicite avec les développeurs, utile pour les éléments sans rôle ni texte stable (compteur, badge…). Les sélecteurs CSS dépendent de la structure et du style : ils cassent au premier refactoring.

### Mode strict, filtrage et chaînage

Une action sur un localisateur qui correspond à **plusieurs** éléments échoue (*strict mode violation*). C'est une protection : Playwright refuse de deviner. On affine en partant d'un conteneur puis en descendant :

```javascript
// @ts-check
// JOUR 1 — Localisateurs (locators) et bonnes pratiques de sélection
//
// Ordre de préférence recommandé par Playwright :
//   1. getByRole      -> ce que voit l'utilisateur ET les technologies d'assistance
//   2. getByLabel / getByPlaceholder / getByText
//   3. getByTestId    -> contrat explicite avec les développeurs (data-testid)
//   4. locator('css') / XPath -> dernier recours, fragile
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('le même champ peut être ciblé de plusieurs façons', async ({ page }) => {
  const parRole = page.getByRole('textbox', { name: 'Nouvelle tâche' });
  const parLabel = page.getByLabel('Nouvelle tâche');
  const parPlaceholder = page.getByPlaceholder('Ex. : Réviser les locators');
  const parTestId = page.getByTestId('todo-input');
  const parCss = page.locator('#todo-input'); // à éviter : dépend de l'implémentation

  for (const locator of [parRole, parLabel, parPlaceholder, parTestId, parCss]) {
    await expect(locator).toBeVisible();
  }
});

test('chaîner et filtrer les locators pour cibler une ligne précise', async ({ page }) => {
  for (const label of ['Acheter du pain', 'Appeler le client']) {
    await page.getByLabel('Nouvelle tâche').fill(label);
    await page.getByRole('button', { name: 'Ajouter' }).click();
  }

  // getByRole('button', { name: 'Supprimer' }) correspond à 2 boutons :
  // une action sur ce locator échouerait en "strict mode violation".
  await expect(page.getByRole('button', { name: 'Supprimer' })).toHaveCount(2);

  // Solution : partir de la ligne (filter) puis descendre vers le bouton (chaînage)
  const ligne = page.getByRole('listitem').filter({ hasText: 'Appeler le client' });
  await expect(ligne.getByRole('button', { name: 'Supprimer' })).toBeVisible();
  await expect(ligne.getByTestId('todo-priority')).toHaveText('Normale');
});
```

| Outil | Usage |
|---|---|
| `.filter({ hasText })` | Garde les éléments contenant un texte |
| `.filter({ has: locator })` | Garde les éléments contenant un autre élément |
| `locator.getByRole(...)` | Cherche *à l'intérieur* du localisateur parent (chaînage) |
| `.first()`, `.last()`, `.nth(i)` | Choix par position : à éviter, l'ordre peut changer |
| `getByText('…', { exact: true })` | Texte exact (par défaut : contient, sans tenir compte de la casse) |

> 💡 **Astuce :** dans le mode UI ou avec `npx playwright codegen`, le bouton « Pick locator » propose le meilleur localisateur pour l'élément survolé.

### Exercice 2 — Cibler la bonne ligne

Dans `tests/mes-exercices/ex02-locators-actions.spec.js` : ajoutez « Tâche urgente » (priorité Haute) et « Tâche tranquille » (priorité Basse), puis supprimez **la tâche de priorité Haute** sans utiliser `first()`, `last()` ni `nth()`. Vérifiez qu'il ne reste qu'une tâche, de priorité Basse. Corrigé : annexe A.2.

- [ ] Je connais l'ordre de préférence des localisateurs.
- [ ] Je sais résoudre une *strict mode violation* avec `filter` et le chaînage.
- [ ] J'ai utilisé « Pick locator » au moins une fois.


---

## Module 5 — Actions utilisateur et assertions

### Actions

| Action | Exemple |
|---|---|
| Naviguer | `page.goto('/')`, `page.goBack()`, `page.reload()` |
| Cliquer | `locator.click()`, `dblclick()`, `click({ button: 'right' })` |
| Saisir | `locator.fill('texte')` (remplace), `pressSequentially('texte')` (frappe touche par touche) |
| Clavier | `locator.press('Enter')`, `page.keyboard.press('Control+A')` |
| Sélectionner | `locator.selectOption('haute')` ou `selectOption({ label: 'Haute' })` |
| Cocher | `locator.check()`, `uncheck()`, `setChecked(true)` |
| Survoler / fichier | `locator.hover()`, `locator.setInputFiles('chemin')` |

```javascript
// @ts-check
// JOUR 1 — Actions utilisateur : saisir, sélectionner, cliquer, naviguer, clavier
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('ajouter une tâche avec une priorité (fill + selectOption + click)', { tag: '@smoke' }, async ({ page }) => {
  await page.getByLabel('Nouvelle tâche').fill('Réviser le Dockerfile');
  await page.getByLabel('Priorité').selectOption('haute'); // par value, ou { label: 'Haute' }
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const ligne = page.getByTestId('todo-item').filter({ hasText: 'Réviser le Dockerfile' });
  await expect(ligne).toBeVisible();
  await expect(ligne.getByTestId('todo-priority')).toHaveText('Haute');
});

test('valider le formulaire avec la touche Entrée (press)', async ({ page }) => {
  const champ = page.getByLabel('Nouvelle tâche');
  await champ.fill('Tâche saisie au clavier');
  await champ.press('Enter');

  await expect(page.getByTestId('todo-list')).toContainText('Tâche saisie au clavier');
});

test('supprimer une tâche', async ({ page }) => {
  // Le test crée lui-même ses données : il ne dépend d'aucun autre test
  await page.getByLabel('Nouvelle tâche').fill('Tâche à supprimer');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const ligne = page.getByTestId('todo-item').filter({ hasText: 'Tâche à supprimer' });
  await ligne.getByRole('button', { name: 'Supprimer' }).click();

  await expect(ligne).toHaveCount(0);
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('naviguer avec les filtres (click sur un lien + URL)', async ({ page }) => {
  await page.getByLabel('Nouvelle tâche').fill('Tâche filtrée');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await page.getByRole('link', { name: 'Terminées' }).click();
  await expect(page).toHaveURL(/filter=done/);
  await expect(page.getByTestId('empty-state')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId('todo-list')).toContainText('Tâche filtrée');
});
```

### Assertions

Les assertions **web-first** (`await expect(locator)…`) réessaient automatiquement jusqu'au délai `expect.timeout` (5 s). Les assertions génériques (`expect(valeur).toBe(…)`) vérifient une valeur une seule fois, immédiatement.

| Assertion | Vérifie que… |
|---|---|
| `toBeVisible()` / `toBeHidden()` | l'élément est affiché / absent ou masqué |
| `toHaveText()` / `toContainText()` | le texte est exactement / contient la valeur (chaîne, regex ou tableau) |
| `toHaveCount(n)` | le localisateur correspond à n éléments |
| `toHaveAttribute(nom, valeur)` | un attribut a la valeur attendue (`data-completed`, `aria-current`…) |
| `toHaveClass(/regex/)` | la classe CSS correspond |
| `toHaveValue()`, `toBeEmpty()` | valeur ou vide d'un champ |
| `toBeEnabled()`, `toBeChecked()` | état d'un contrôle |
| `expect(page).toHaveURL()` / `toHaveTitle()` | URL ou titre de la page |
| `.not.` + assertion | négation, ex. `not.toHaveClass(/is-done/)` |
| `expect.soft(…)` | l'échec est enregistré mais le test continue |

### Exercice 3 — Tester une user story

> 📌 **À retenir :** **En tant qu'**utilisateur de la Todo List, **je veux** marquer une tâche comme terminée puis annuler ce statut, **afin de** suivre l'avancement sans supprimer mes tâches.

Critères d'acceptation :

- un bouton unique bascule l'état : « Terminer » si la tâche est en cours, « Réouvrir » si elle est terminée ;
- une tâche terminée porte `data-completed="true"` et son libellé a la classe CSS `is-done` (texte barré) ;
- le compteur se met à jour : « 1 tâche restante » → « 0 tâche restante » ;
- l'action est réversible.

Écrivez `tests/mes-exercices/ex03-terminer-reouvrir.spec.js` **sans ouvrir** `tests/jour1/04-assertions.spec.js`. Une fois votre test au vert, comparez avec ce fichier et avec l'annexe A.3.

- [ ] Je distingue assertion web-first et assertion générique.
- [ ] J'ai utilisé `selectOption`, `press` et une navigation par lien.
- [ ] Mon test de la user story vérifie les quatre critères d'acceptation.


---

## Module 6 — Synchronisation et éléments dynamiques

### L'attente automatique (auto-waiting)

Avant chaque action, Playwright vérifie que l'élément est **attaché** au DOM, **visible**, **stable** (pas en animation), **activé** et qu'il **reçoit les événements** (non recouvert). Il réessaie jusqu'au délai de l'action. Les assertions web-first réessaient de la même manière. Conséquence : il n'y a presque jamais besoin d'attente explicite.

| À faire | À ne pas faire |
|---|---|
| `await expect(locator).toHaveText('2')` | `await page.waitForTimeout(2000)` puis lire le texte |
| `await expect(toast).toBeHidden()` | `const t = await locator.textContent(); expect(t).toBe('2')` sur un contenu chargé en AJAX |
| `page.waitForResponse('**/api/stats')` armé **avant** l'action | attendre la réponse **après** l'action (elle est peut-être déjà passée) |
| augmenter un délai ciblé : `toHaveText('0', { timeout: 10_000 })` | augmenter le timeout global pour masquer un problème |

### Les cas dynamiques de la Todo List

- **Statistiques AJAX** : `/api/stats` répond en 0,5 à 2 s (délai aléatoire, comme un vrai back-end chargé).
- **Message temporaire** (`role="status"`) : affiché après un ajout, supprimé par JavaScript au bout de 3 s.
- **Boîte de dialogue** native `confirm()` avant de vider la liste : Playwright la **refuse** par défaut, il faut l'intercepter avec `page.once('dialog', …)`.
- **Réseau simulé** : `page.route()` permet de renvoyer de fausses données ou une erreur 500 pour tester l'affichage d'erreur.

```javascript
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
```

### Exercice 4 — Fiabiliser un scénario dynamique

Dans `tests/mes-exercices/ex04-synchronisation.spec.js`, sans aucun `waitForTimeout` :

1. ajoutez deux tâches, terminez-en une et vérifiez que les statistiques affichent Total 2 et Terminées 1 ;
2. vérifiez que le message de confirmation apparaît puis disparaît, puis videz la liste en acceptant la confirmation ;
3. bonus : avec `page.route`, retardez la réponse de `/api/stats` de 3 s et adaptez **uniquement** le délai de l'assertion concernée.

Lancez votre fichier 5 fois de suite pour prouver sa stabilité : `npx playwright test ex04 --project=chromium --repeat-each=5`. Corrigé : annexe A.4.

- [ ] Je connais les vérifications d'actionnabilité faites avant chaque action.
- [ ] Je sais gérer une boîte de dialogue, un élément qui disparaît et une réponse réseau.
- [ ] Mon exercice 4 passe 5 fois sur 5.


---

## Module 7 — Organiser une suite de tests

### Fichiers, nommage, découpage

- **Un fichier = une fonctionnalité** (ou un parcours) : `filtres.spec.js`, `ajout-tache.spec.js`. Ici, les fichiers sont numérotés par chapitre pour suivre la formation.
- **Titre de test = comportement attendu**, au présent, du point de vue de l'utilisateur : « le filtre Actives n'affiche que les tâches en cours ».
- `test.describe()` regroupe les tests d'une même fonctionnalité et partage leurs hooks.
- **Tags** (`{ tag: '@smoke' }`) pour lancer des sous-ensembles : smoke à chaque commit, régression complète la nuit.
- **Annotations** : `test.skip()`, `test.fixme()`, `test.fail()`, `test.slow()` documentent un état connu dans le rapport.
- Chaque test est **indépendant** : il crée ses propres données et ne dépend jamais de l'ordre d'exécution.

### Hooks et étapes

| Hook | Exécuté… | Usage typique |
|---|---|---|
| `test.beforeEach` | avant chaque test du fichier ou du `describe` | ouvrir la page, créer les données communes |
| `test.afterEach` | après chaque test | journaliser, nettoyer une ressource externe |
| `test.beforeAll` / `afterAll` | une fois par worker | préparation coûteuse (compte, base de données) — pas de `page` ici |
| `test.step('titre', …)` | dans un test | découper un long scénario en étapes lisibles dans le rapport |

```javascript
// @ts-check
// JOUR 2 — Organisation d'une suite : describe, hooks, étapes, tags, annotations
//
// Conventions de nommage utilisées dans ce projet :
//   - un fichier = une fonctionnalité ou un chapitre : <numéro>-<sujet>.spec.js
//   - titre de test = comportement attendu, au présent, vu par l'utilisateur
//   - tags (@smoke, @regression) pour lancer un sous-ensemble : --grep @smoke
import { test, expect } from '@playwright/test';

test.describe('Filtrer les tâches', { tag: '@regression' }, () => {
  // beforeEach : exécuté avant CHAQUE test du bloc -> données de départ communes
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    for (const label of ['Tâche active', 'Tâche terminée']) {
      await page.getByLabel('Nouvelle tâche').fill(label);
      await page.getByRole('button', { name: 'Ajouter' }).click();
    }
    await page.getByTestId('todo-item')
      .filter({ hasText: 'Tâche terminée' })
      .getByRole('button', { name: 'Terminer' })
      .click();
    await expect(page.getByTestId('todo-counter')).toHaveText('1 tâche restante');
  });

  // afterEach : utile pour journaliser ou nettoyer des ressources externes
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      console.log(`Échec de "${testInfo.title}" sur ${page.url()}`);
    }
  });

  test('le filtre "Actives" n\'affiche que les tâches en cours', async ({ page }) => {
    await test.step('appliquer le filtre', async () => {
      await page.getByRole('link', { name: 'Actives' }).click();
    });
    await test.step('vérifier la liste', async () => {
      await expect(page.getByTestId('todo-label')).toHaveText(['Tâche active']);
      await expect(page.getByRole('link', { name: 'Actives' })).toHaveAttribute('aria-current', 'page');
    });
  });

  test('le filtre "Terminées" n\'affiche que les tâches terminées', async ({ page }) => {
    await page.getByRole('link', { name: 'Terminées' }).click();
    await expect(page.getByTestId('todo-label')).toHaveText(['Tâche terminée']);
  });

  test('réouvrir une tâche depuis le filtre "Terminées" la retire de la vue', async ({ page }) => {
    await page.getByRole('link', { name: 'Terminées' }).click();
    await page.getByRole('button', { name: 'Réouvrir' }).click();

    await expect(page).toHaveURL(/filter=done/);
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });
});

// Annotations : documenter un test ignoré ou un bug connu directement dans le rapport
test('export CSV des tâches', async () => {
  test.fixme(true, 'Fonctionnalité pas encore développée (ticket TODO-42)');
});
```

### Exercice 5 — Réorganiser

Créez `tests/mes-exercices/ex05-hooks-organisation.spec.js` : un `describe` « Cycle de vie d'une tâche » tagué `@regression`, un `beforeEach` qui ouvre la page et crée une tâche, puis trois tests courts (la tâche est active, elle peut être terminée puis réouverte avec deux `test.step`, elle peut être supprimée). Taguez le premier test `@smoke` et lancez `npx playwright test --grep @smoke`. Corrigé : annexe A.5.

- [ ] Mes fichiers et mes tests sont nommés selon le comportement testé.
- [ ] J'utilise `beforeEach` pour les préparations communes.
- [ ] Je sais lancer un sous-ensemble de tests par tag.


---

## Module 8 — Fixtures, données de test et Page Object Model

### Le Page Object Model (POM)

Sans POM, les mêmes localisateurs sont recopiés dans des dizaines de tests : un libellé de bouton qui change oblige à tous les corriger. Le Page Object regroupe la connaissance d'une page (ses localisateurs et ses actions métier) dans une classe. Les tests ne décrivent plus que le **quoi** ; le Page Object sait le **comment**.

```javascript
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
```

### Les fixtures personnalisées

Une **fixture** est un objet que Playwright prépare avant le test et nettoie après (`page`, `context`, `browser`, `request` sont des fixtures intégrées). `test.extend()` permet d'en créer : ici `todoPage` (un Page Object déjà sur la page d'accueil) et `listeRemplie` (une liste alimentée avec `data/taches.json`). Une fixture n'est créée que si le test la demande en paramètre.

```javascript
// @ts-check
// [J2] Fixtures personnalisées : on étend le `test` de Playwright pour injecter
// automatiquement des objets prêts à l'emploi dans chaque test.
//
//   import { test, expect } from '../../fixtures/todo-test.js';
//   test('...', async ({ todoPage }) => { ... });
//
import { test as base, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage.js';
import taches from '../data/taches.json' with { type: 'json' };

export const test = base.extend({
  // Fixture `todoPage` : un Page Object déjà positionné sur la page d'accueil.
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage); // <- le test s'exécute ici
    // (code après use() = nettoyage ; inutile ici : chaque test a sa propre session)
  },

  // Fixture `listeRemplie` : une liste déjà alimentée avec le jeu de données de référence.
  listeRemplie: async ({ todoPage }, use) => {
    for (const tache of taches) {
      await todoPage.add(tache.label, tache.priority);
    }
    await use(todoPage);
  },
});

export { expect, taches };
```

```javascript
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
```

### Données de test

- **Jeu de données externe** (`data/taches.json`) : partagé entre fixtures et tests, modifiable sans toucher au code.
- **Tests paramétrés** : une boucle `for … of` génère un test par cas, chacun visible séparément dans le rapport.
- **Données uniques** : en environnement partagé, suffixez les libellés (`Tâche ${Date.now()}`) pour éviter les collisions.
- **Préparer par l'API plutôt que par l'interface** quand c'est possible (fixture `request`) : plus rapide et plus stable.

```javascript
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
```

### Exercice 6 — Utiliser le POM et les fixtures

Dans `tests/mes-exercices/ex06-pom-fixtures.spec.js`, importez `test` et `expect` depuis `../../fixtures/todo-test.js`. Avec la fixture `listeRemplie`, terminez la première tâche du jeu de données, puis vérifiez le contenu des filtres « Terminées » et « Actives » **sans écrire un seul localisateur** dans le test. Corrigé : annexe A.6.

### Exercice 7 — Test paramétré

Dans `tests/mes-exercices/ex07-donnees-compteur.spec.js`, générez un test par cas pour vérifier le pluriel du compteur : 0 → « 0 tâche restante », 1 → « 1 tâche restante », 2 → « 2 tâches restantes », 3 → « 3 tâches restantes ». Corrigé : annexe A.7.

- [ ] Je sais expliquer le rôle d'un Page Object et d'une fixture.
- [ ] Mes tests du module 8 ne contiennent aucun localisateur.
- [ ] J'ai généré des tests à partir d'un tableau de données.


---

## Module 9 — Faire évoluer une base de tests dans le temps

| Bonne pratique | Pourquoi |
|---|---|
| Tester le comportement visible, pas l'implémentation | Le test survit aux refactorings du code et du CSS |
| Localisateurs orientés utilisateur, `data-testid` négociés avec les devs | Moins de casse, et l'accessibilité est vérifiée au passage |
| Tests isolés, données créées par chaque test | Parallélisation possible, échecs reproductibles |
| Aucun `waitForTimeout` | Tests rapides et stables |
| Un Page Object par page ou composant, sans assertion métier dedans | Une seule correction quand l'interface change |
| Code de test relu en merge request comme le code applicatif | Le code de test est du code de production |
| Un test instable est corrigé ou mis en quarantaine (`test.fixme`) avec un ticket | Une suite à laquelle on ne fait plus confiance ne sert plus à rien |
| Mettre à jour Playwright régulièrement (`npm i -D @playwright/test@latest` puis `npx playwright install`) | Nouveaux navigateurs, corrections, nouvelles API |
| Garder la même version entre `package.json`, l'image Docker et la CI | Évite l'erreur « Executable doesn't exist » |

> ℹ️ **À savoir :** le dépôt fournit déjà deux exemples de dette : un test `fixme` documenté avec un ticket (module 7) et un atelier de tests défectueux (module 11).


---

## Module 10 — Multi-navigateurs et parallélisation

### Projects : un projet par navigateur

Dans `playwright.config.js`, la section `projects` déclare **chromium**, **firefox**, **webkit** et **mobile-chrome** (émulation d'un Pixel 7). Sans option `--project`, chaque test est exécuté sur les quatre.

```javascript
// @ts-check
// Configuration Playwright de la formation (chapitres concernés entre crochets).
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const slowMo = Number(process.env.PLAYWRIGHT_SLOW_MO || 0);


export default defineConfig({
  // [J1] Dossier contenant les fichiers *.spec.js
  testDir: './tests',

  // [J2] Parallélisation : chaque test de chaque fichier peut tourner dans un worker différent
  fullyParallel: true,
  // [J2] Nombre de workers : automatique en local (moitié des cœurs), 2 en CI pour rester stable
  workers: isCI ? 2 : undefined,

  // [J2] En CI : interdit les test.only oubliés et réessaie 2 fois un test en échec
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,

  // [J1] Délai max d'un test (30 s par défaut) et des assertions expect (5 s par défaut)
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // [J2] Rapports : liste dans le terminal + HTML ; en CI on ajoute JUnit (lu par GitLab / GitHub)
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'junit/results.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    // [J1] URL de l'application : localhost en local, http://todo-app:8000 dans Docker / GitLab
    // (jamais http://app:8000 : ".app" est un domaine que les navigateurs forcent en HTTPS)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000',

    // [J2] Artefacts de diagnostic
    trace: 'on-first-retry',          // trace complète rejouable dans le Trace Viewer
    screenshot: 'only-on-failure',    // capture d'écran si le test échoue
    video: 'retain-on-failure',       // vidéo conservée uniquement en cas d'échec

    // [J1] Mode pédagogique : ralentit chaque action (npm run test:pedagogique)
    launchOptions: { slowMo },
  },

  // [J2] Exécution multi-navigateurs : un "projet" par navigateur / appareil
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
```

### TP guidé

```bash
npx playwright test                              # 4 projets, en parallèle
npx playwright test --project=webkit --project=firefox
npx playwright test --workers=1                  # comparez la durée totale
npx playwright test --workers=4
npx playwright test --shard=1/2                  # moitié des tests (utilisé en CI)
npx playwright test --shard=2/2
```

| Notion | Définition |
|---|---|
| Worker | Processus Node.js indépendant qui exécute des tests avec son propre navigateur |
| `fullyParallel: true` | Les tests d'un même fichier peuvent aussi être répartis entre workers |
| `test.describe.configure({ mode: 'serial' })` | Force l'exécution en séquence d'un groupe (à éviter, signe de dépendance entre tests) |
| Sharding (`--shard=i/n`) | Découpe la suite entre plusieurs machines de CI |

> 📌 **À retenir :** les tests ne passent en parallèle que parce qu'ils sont isolés : chaque test a son propre contexte de navigateur, donc sa propre session côté Symfony.

- [ ] J'ai exécuté la suite sur les trois moteurs de rendu.
- [ ] J'ai mesuré l'effet du nombre de workers.
- [ ] Je sais à quoi sert le sharding.


---

## Module 11 — Rapports, traces et diagnostic des échecs

### Les outils

| Outil | Commande / configuration | Ce qu'il apporte |
|---|---|---|
| Rapport HTML | `npx playwright show-report` | Résultat par test et par navigateur, erreurs, pièces jointes |
| Captures et vidéos | `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` | L'état de l'écran au moment de l'échec |
| Trace Viewer | `trace: 'on-first-retry'` ou `--trace on`, puis `npx playwright show-trace trace.zip` | Chaque action avec le DOM avant/après, le réseau, la console, le code source |
| Mode UI | `npx playwright test --ui` | Exécution interactive, chronologie, watch mode |
| Inspecteur | `--debug` ou `await page.pause()` | Exécution pas à pas, test de localisateurs en direct |
| Extension VS Code | Testing → Playwright | Lancer, déboguer avec points d'arrêt, « Pick locator » |
| Reporters CI | `junit`, `blob` + `merge-reports` | Résultats lisibles par GitLab / GitHub, rapport fusionné |

### Méthode de diagnostic

1. **Lire le message d'erreur** dans le terminal : quel localisateur, quelle assertion, valeur attendue / reçue.
2. **Ouvrir la trace** : à quelle action le test a-t-il divergé ? Que montrait le DOM à ce moment ?
3. **Classer la cause** : bug de l'application, test erroné (localisateur, donnée, attente), environnement (app arrêtée, réseau), ou **test instable** (passe parfois).
4. **Reproduire** : `--repeat-each=10`, `--workers=1`, `--project=…` pour confirmer l'hypothèse.
5. **Corriger la cause**, jamais le symptôme (pas de `waitForTimeout`, pas de `retries` pour cacher un problème).

### Exercice 8 — Atelier diagnostic

Le fichier `tests/jour2/09-atelier-diagnostic.spec.js` contient trois tests défectueux, ignorés par défaut. Lancez-les avec la trace activée :

```bash
DIAGNOSTIC=1 npx playwright test 09-atelier --project=chromium --trace on
# Windows PowerShell : $env:DIAGNOSTIC=1; npx playwright test 09-atelier --project=chromium --trace on
npx playwright show-report
```

Pour chaque test : identifiez la cause à l'aide du message et de la trace, classez-la, puis corrigez-la dans une copie `tests/mes-exercices/ex08-diagnostic.spec.js`. Un des trois tests **passe parfois** : lancez-le avec `--repeat-each=10` pour le démasquer. Corrigé : annexe A.8.

- [ ] J'ai ouvert une trace et navigué dans la chronologie des actions.
- [ ] J'ai identifié et corrigé les trois causes d'échec.
- [ ] Je sais reconnaître et reproduire un test instable.


---

## Module 12 — Intégration continue

### Principes

- La suite tourne **à chaque push et à chaque merge request**, sur un environnement neuf.
- L'application testée est démarrée **dans le pipeline** (ici avec Docker), puis on attend qu'elle réponde.
- D'abord un jeu **smoke** rapide qui bloque le reste s'il échoue, puis la suite complète en parallèle.
- En CI : `retries: 2`, `forbidOnly`, rapports **conservés en artefacts** même en cas d'échec, résultats JUnit publiés dans la merge request.
- Les versions sont figées : `npm ci` (lock file) et image Playwright de **même version** que `@playwright/test`.

### GitHub Actions — `.github/workflows/ci.yml`

Trois jobs : **smoke** (Chromium, tag `@smoke`), **e2e** (matrice d'un job par navigateur, rapports *blob*) et **rapport** (fusion des blobs en un seul rapport HTML téléchargeable).

```yaml
# =============================================================================
# CI GitHub Actions — Tests end-to-end Playwright (formation Jour 2)
#
#  1. smoke   : tests @smoke sur Chromium, rapide, bloque le reste s'il échoue
#  2. e2e     : suite complète, une exécution par navigateur (matrice) en parallèle
#  3. rapport : fusion des rapports de chaque navigateur en UN rapport HTML
# =============================================================================
name: Tests E2E Playwright

on:
  push:
    branches: [main, 'formation-**']
  pull_request:
    branches: [main]
  workflow_dispatch:          # bouton "Run workflow" dans l'onglet Actions

concurrency:
  group: e2e-${{ github.ref }}
  cancel-in-progress: true

env:
  CI: true
  PLAYWRIGHT_BASE_URL: http://localhost:8000

jobs:
  smoke:
    name: Smoke (Chromium)
    runs-on: ubuntu-latest
    timeout-minutes: 15
    defaults:
      run:
        working-directory: playwright-tests
    steps:
      - uses: actions/checkout@v7

      - name: Démarrer l'application Symfony (attend le healthcheck)
        working-directory: .
        run: docker compose up -d --build --wait app

      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: playwright-tests/package-lock.json

      - name: Installer les dépendances
        run: npm ci

      - name: Installer Chromium et ses dépendances système
        run: npx playwright install --with-deps chromium

      - name: Lancer les tests @smoke
        run: npx playwright test --project=chromium --grep @smoke

      - name: Publier le rapport (même en cas d'échec)
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v7
        with:
          name: rapport-smoke
          path: playwright-tests/playwright-report/
          retention-days: 7

  e2e:
    name: E2E (${{ matrix.project }})
    needs: smoke
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false        # un navigateur en échec n'annule pas les autres
      matrix:
        project: [chromium, firefox, webkit, mobile-chrome]
    defaults:
      run:
        working-directory: playwright-tests
    steps:
      - uses: actions/checkout@v7

      - name: Démarrer l'application Symfony
        working-directory: .
        run: docker compose up -d --build --wait app

      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: playwright-tests/package-lock.json

      - run: npm ci

      - name: Installer les navigateurs
        run: npx playwright install --with-deps

      - name: Lancer la suite complète
        # Rapport "blob" : format intermédiaire destiné à être fusionné
        run: npx playwright test --project=${{ matrix.project }} --reporter=blob,list

      - name: Publier le rapport blob
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v7
        with:
          name: blob-${{ matrix.project }}
          path: playwright-tests/blob-report/
          retention-days: 1

      - name: Publier traces, captures et vidéos (en cas d'échec)
        if: ${{ failure() }}
        uses: actions/upload-artifact@v7
        with:
          name: resultats-${{ matrix.project }}
          path: playwright-tests/test-results/
          retention-days: 7

      - name: Journaux de l'application (en cas d'échec)
        if: ${{ failure() }}
        working-directory: .
        run: docker compose logs app

  rapport:
    name: Rapport HTML fusionné
    needs: e2e
    if: ${{ !cancelled() }}
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: playwright-tests
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: playwright-tests/package-lock.json
      - run: npm ci

      - name: Télécharger les rapports blob de chaque navigateur
        uses: actions/download-artifact@v8
        with:
          path: playwright-tests/all-blob-reports
          pattern: blob-*
          merge-multiple: true

      - name: Fusionner en un rapport HTML
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - name: Publier le rapport final
        uses: actions/upload-artifact@v7
        with:
          name: playwright-report
          path: playwright-tests/playwright-report/
          retention-days: 14
```

### GitLab CI — `.gitlab-ci.yml`

L'image de l'application est construite et poussée dans le registre du projet, puis utilisée comme **service** par les jobs de test qui tournent dans l'image officielle Playwright. La suite complète est découpée en 2 shards (`parallel: 2`) et les résultats JUnit s'affichent dans la merge request.

```yaml
# =============================================================================
# CI GitLab — Tests end-to-end Playwright (formation Jour 2)
#
#  build : construit l'image de l'application Symfony et la pousse dans le
#          registre de conteneurs du projet GitLab
#  test  : lance l'application comme "service" et exécute Playwright dans
#          l'image officielle (navigateurs déjà installés)
#          -> smoke d'abord, puis la suite complète découpée en 2 shards
# =============================================================================
stages:
  - build
  - smoke
  - test

variables:
  APP_IMAGE: $CI_REGISTRY_IMAGE/app:$CI_COMMIT_SHORT_SHA
  PLAYWRIGHT_IMAGE: mcr.microsoft.com/playwright:v1.64.1-noble   # = version de package.json
  CI: "true"

build-app:
  stage: build
  image: docker:28
  services:
    - docker:28-dind
  script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"
    - docker build -t "$APP_IMAGE" symfony-app
    - docker push "$APP_IMAGE"

# Modèle commun aux jobs de test (réutilisé via "extends")
.playwright:
  image: $PLAYWRIGHT_IMAGE
  services:
    - name: $APP_IMAGE
      alias: todo-app                # joignable sur http://todo-app:8000 (pas "app" : .app force HTTPS)
  variables:
    PLAYWRIGHT_BASE_URL: http://todo-app:8000
  before_script:
    - cd playwright-tests
    - npm ci
    # Attendre que l'application réponde (60 s maximum)
    - timeout 60 sh -c 'until node -e "fetch(process.env.PLAYWRIGHT_BASE_URL).then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"; do sleep 2; done'
  artifacts:
    when: always
    expire_in: 7 days
    paths:
      - playwright-tests/playwright-report/
      - playwright-tests/test-results/
    reports:
      junit: playwright-tests/junit/results.xml   # résultats visibles dans la merge request

smoke:
  extends: .playwright
  stage: smoke
  script:
    - npx playwright test --project=chromium --grep @smoke

e2e:
  extends: .playwright
  stage: test
  parallel: 2                        # 2 jobs en parallèle, chacun exécute la moitié des tests
  script:
    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

> ⚠️ **Attention :** dans Docker ou GitLab, l'application est jointe par le nom `todo-app`, jamais `app` : « .app » est un domaine de premier niveau que tous les navigateurs forcent en HTTPS (liste HSTS préchargée). Une URL `http://app:8000` échoue avec `ERR_CONNECTION_CLOSED` sous Chromium et `NS_ERROR_NET_RESET` sous Firefox.

### Exercice 9 — Votre pipeline

1. Forkez (GitHub) ou importez (GitLab) le dépôt, poussez la branche `formation-2-jours`.
2. Observez le pipeline : ordre des jobs, durée, parallélisme.
3. Téléchargez l'artefact `playwright-report` et ouvrez-le (`npx playwright show-report <dossier>`).
4. Cassez volontairement un test (texte attendu erroné), poussez : le pipeline doit être rouge. Analysez la trace depuis l'artefact, puis réparez.
5. Bonus : ajoutez une exécution planifiée chaque nuit (`schedule` sous GitHub, *Pipeline schedules* sous GitLab).

### Reproduire la CI en local, sans Node.js

```bash
docker compose up -d --wait app
CI=true docker compose run --rm playwright
docker compose down
```

- [ ] Mon pipeline s'exécute à chaque push.
- [ ] Je sais récupérer et lire le rapport et la trace d'un échec en CI.
- [ ] Je sais expliquer la différence entre smoke, matrice de navigateurs et sharding.


---

## Aide-mémoire

### Commandes

| Commande | Effet |
|---|---|
| `docker compose up -d --wait app` | Démarre l'application sur http://localhost:8000 |
| `docker compose down` | Arrête l'application |
| `npm ci` puis `npx playwright install --with-deps` | Installe dépendances et navigateurs |
| `npm test` / `npm run test:chromium` | Toute la suite, 4 projets / Chromium seul |
| `npm run test:jour1` / `test:jour2` | Démonstrations d'une journée |
| `npm run test:smoke` | Tests tagués `@smoke` |
| `npm run test:ui` / `test:debug` / `test:headed` | Modes interactifs |
| `npm run test:pedagogique` | Navigateur visible et ralenti |
| `npm run codegen` | Enregistreur de tests sur la Todo List |
| `npm run report` | Dernier rapport HTML |

### Dépannage

| Problème | Solution |
|---|---|
| `ERR_CONNECTION_REFUSED` sur localhost:8000 | L'application n'est pas démarrée : `docker compose up -d --wait app` |
| `Executable doesn't exist` | Navigateurs absents ou de mauvaise version : `npx playwright install` |
| Un navigateur ne démarre pas sous Linux | `sudo npx playwright install-deps` |
| `strict mode violation` | Le localisateur trouve plusieurs éléments : `filter` + chaînage (module 4) |
| `Timeout 5000ms exceeded` sur un `expect` | Ouvrir la trace ; vérifier le texte attendu ; augmenter le délai de cette seule assertion si l'attente est légitime |
| Un test passe seul mais échoue dans la suite | Dépendance entre tests ou donnée partagée : rendre le test autonome |
| `ERR_CONNECTION_CLOSED` en Docker/CI | URL `http://app:…` : utiliser `todo-app` (domaine .app forcé en HTTPS) |
| Port 8000 déjà utilisé | Changer le mapping (`"8080:8000"`) et définir `PLAYWRIGHT_BASE_URL` |
| Erreur 500 après modification de l'app | `docker compose up -d --build --wait app` |

### Glossaire

| Terme | Définition |
|---|---|
| E2E | Test d'un parcours complet, de l'interface jusqu'au serveur, dans un vrai navigateur |
| Headless / headed | Navigateur sans / avec fenêtre visible |
| Locator | Description d'un élément, évaluée au moment de l'action |
| Assertion web-first | `await expect(locator)…` : réessaie jusqu'au délai |
| Auto-waiting | Attente automatique de l'actionnabilité avant chaque action |
| Browser context | Profil de navigateur isolé (cookies, stockage) créé pour chaque test |
| Fixture | Objet préparé pour un test et nettoyé après (`page`, `todoPage`…) |
| Hook | Code exécuté avant/après les tests (`beforeEach`…) |
| Page Object | Classe qui encapsule localisateurs et actions d'une page |
| Project | Configuration nommée (navigateur, appareil) dans `playwright.config.js` |
| Worker / shard | Processus d'exécution parallèle / fraction de la suite sur une machine de CI |
| Trace | Enregistrement rejouable de l'exécution (actions, DOM, réseau, console) |
| Flaky | Test instable : passe ou échoue sans changement de code |
| Artefact | Fichier conservé par la CI (rapport, traces) |


---

## Annexe — Corrigés des exercices

> ℹ️ **À savoir :** les corrigés sont aussi dans `playwright-tests/solutions/` et s'exécutent avec `npm run test:solutions`.

### A.1 — Exercice 1 : liste vide

<details>
<summary>solutions/ex01-liste-vide.spec.js</summary>

```javascript
// @ts-check
// CORRIGÉ — Exercice 1 (J1) : message affiché quand la liste est vide
// Point clé : chaque test démarre avec une session neuve -> la liste est déjà vide,
// aucune boucle de suppression n'est nécessaire.
import { test, expect } from '@playwright/test';

test('affiche "Aucune tâche pour le moment" quand la liste est vide', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('empty-state')).toHaveText('Aucune tâche pour le moment');
});

test('le message disparaît dès qu\'une tâche est ajoutée et revient après suppression', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Première tâche');
  await page.getByRole('button', { name: 'Ajouter' }).click();
  await expect(page.getByTestId('empty-state')).toBeHidden();

  await page.getByRole('button', { name: 'Supprimer' }).click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});
```

</details>

### A.2 — Exercice 2 : localisateurs et actions

<details>
<summary>solutions/ex02-locators-actions.spec.js</summary>

```javascript
// @ts-check
// CORRIGÉ — Exercice 2 (J1) : localisateurs et actions
// Ajouter deux tâches de priorités différentes, supprimer la tâche "Haute"
// en ciblant le bon bouton "Supprimer" (filter + chaînage).
import { test, expect } from '@playwright/test';

test('supprimer précisément la tâche de priorité haute', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Nouvelle tâche').fill('Tâche urgente');
  await page.getByLabel('Priorité').selectOption({ label: 'Haute' });
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await page.getByLabel('Nouvelle tâche').fill('Tâche tranquille');
  await page.getByLabel('Priorité').selectOption({ label: 'Basse' });
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await page.getByRole('listitem')
    .filter({ has: page.getByTestId('todo-priority').filter({ hasText: 'Haute' }) })
    .getByRole('button', { name: 'Supprimer' })
    .click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
  await expect(page.getByTestId('todo-label')).toHaveText('Tâche tranquille');
  await expect(page.getByTestId('todo-priority')).toHaveText('Basse');
});
```

</details>

### A.3 — Exercice 3 : user story terminer / réouvrir

<details>
<summary>solutions/ex03-terminer-reouvrir.spec.js</summary>

```javascript
// @ts-check
// CORRIGÉ — Exercice 3 (J1) : écrire le test de la user story "terminer / réouvrir"
import { test, expect } from '@playwright/test';

test('terminer puis réouvrir une tâche', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Rédiger le compte rendu');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  const ligne = page.getByTestId('todo-item').filter({ hasText: 'Rédiger le compte rendu' });
  const compteur = page.getByTestId('todo-counter');
  await expect(compteur).toHaveText('1 tâche restante');

  await ligne.getByRole('button', { name: 'Terminer' }).click();
  await expect(ligne).toHaveAttribute('data-completed', 'true');
  await expect(ligne.getByTestId('todo-label')).toHaveClass(/is-done/);
  await expect(compteur).toHaveText('0 tâche restante');

  await ligne.getByRole('button', { name: 'Réouvrir' }).click();
  await expect(ligne).toHaveAttribute('data-completed', 'false');
  await expect(compteur).toHaveText('1 tâche restante');
});
```

</details>

### A.4 — Exercice 4 : synchronisation

<details>
<summary>solutions/ex04-synchronisation.spec.js</summary>

```javascript
// @ts-check
// CORRIGÉ — Exercice 4 (J1) : éléments dynamiques, sans aucun waitForTimeout
import { test, expect } from '@playwright/test';

test('les statistiques AJAX reflètent les tâches créées', async ({ page }) => {
  await page.goto('/');
  for (const label of ['A', 'B']) {
    await page.getByLabel('Nouvelle tâche').fill(label);
    await page.getByRole('button', { name: 'Ajouter' }).click();
  }
  await page.getByTestId('todo-item')
    .filter({ has: page.getByText('A', { exact: true }) })
    .getByRole('button', { name: 'Terminer' }).click();

  // Les stats arrivent 0,5 à 2 s après chaque chargement de page : expect attend
  await expect(page.getByTestId('stats-total')).toHaveText('2');
  await expect(page.getByTestId('stats-done')).toHaveText('1');
});

test('le toast disparaît et la liste peut être vidée après confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Nouvelle tâche').fill('Tâche temporaire');
  await page.getByRole('button', { name: 'Ajouter' }).click();

  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByRole('status')).toBeHidden();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Vider la liste' }).click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('bonus : un back-end lent (3 s) ne casse pas le test si le délai est adapté', async ({ page }) => {
  await page.route('**/api/stats', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await route.continue();
  });
  await page.goto('/');
  await expect(page.getByTestId('stats-total')).toHaveText('0', { timeout: 10_000 });
});
```

</details>

### A.5 — Exercice 5 : hooks et organisation

<details>
<summary>solutions/ex05-hooks-organisation.spec.js</summary>

```javascript
// @ts-check
// CORRIGÉ — Exercice 5 (J2) : réorganiser avec describe, beforeEach, test.step et tags
import { test, expect } from '@playwright/test';

test.describe('Cycle de vie d\'une tâche', { tag: '@regression' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nouvelle tâche').fill('Tâche de référence');
    await page.getByRole('button', { name: 'Ajouter' }).click();
  });

  test('une tâche ajoutée est active', { tag: '@smoke' }, async ({ page }) => {
    await expect(page.getByTestId('todo-item')).toHaveAttribute('data-completed', 'false');
  });

  test('une tâche peut être terminée puis réouverte', async ({ page }) => {
    const ligne = page.getByTestId('todo-item');
    await test.step('terminer', async () => {
      await ligne.getByRole('button', { name: 'Terminer' }).click();
      await expect(ligne).toHaveAttribute('data-completed', 'true');
    });
    await test.step('réouvrir', async () => {
      await ligne.getByRole('button', { name: 'Réouvrir' }).click();
      await expect(ligne).toHaveAttribute('data-completed', 'false');
    });
  });

  test('une tâche peut être supprimée', async ({ page }) => {
    await page.getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });
});
```

</details>

### A.6 — Exercice 6 : POM et fixtures

<details>
<summary>solutions/ex06-pom-fixtures.spec.js</summary>

```javascript
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
```

</details>

### A.7 — Exercice 7 : test paramétré

<details>
<summary>solutions/ex07-donnees-compteur.spec.js</summary>

```javascript
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
```

</details>

### A.8 — Exercice 8 : atelier diagnostic

| Test | Cause | Catégorie | Correction |
|---|---|---|---|
| Bug 1 | `getByRole('button', { name: 'Supprimer' })` trouve 2 boutons | Test erroné (localisateur) | Filtrer la ligne « Jeter » puis chaîner vers son bouton |
| Bug 2 | `waitForTimeout(300)` + `textContent()` : passe seulement si l'API répond en moins de 1,3 s | Test instable (attente) | `await expect(…).toHaveText('0')` |
| Bug 3 | Suppose que la tâche du bug 1 existe : chaque test a pourtant une session neuve | Test erroné (dépendance) | Créer la tâche dans le test |

<details>
<summary>solutions/ex08-diagnostic-corrige.spec.js</summary>

```javascript
// @ts-check
// CORRIGÉ — Exercice 8 (J2) : version réparée de tests/jour2/09-atelier-diagnostic.spec.js
//   Bug 1 : locator ambigu (strict mode violation) -> filtrer sur la ligne
//   Bug 2 : waitForTimeout + lecture immédiate -> assertion web-first
//   Bug 3 : test dépendant d'un autre test -> chaque test crée ses données
import { test, expect } from '@playwright/test';

test.describe('Atelier diagnostic (corrigé)', () => {
  test('bug 1 : supprimer la deuxième tâche', async ({ page }) => {
    await page.goto('/');
    for (const label of ['Garder', 'Jeter']) {
      await page.getByLabel('Nouvelle tâche').fill(label);
      await page.getByRole('button', { name: 'Ajouter' }).click();
    }
    await page.getByTestId('todo-item').filter({ hasText: 'Jeter' })
      .getByRole('button', { name: 'Supprimer' }).click();
    await expect(page.getByTestId('todo-label')).toHaveText(['Garder']);
  });

  test('bug 2 : lire les statistiques', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('stats-total')).toHaveText('0');
  });

  test('bug 3 : terminer la tâche créée', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nouvelle tâche').fill('Tâche partagée');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await page.getByRole('button', { name: 'Terminer' }).click();
    await expect(page.getByTestId('todo-counter')).toHaveText('0 tâche restante');
  });
});
```

</details>
