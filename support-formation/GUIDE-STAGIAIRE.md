# Guide stagiaire — Tester une application Symfony avec Playwright

> Ce guide se suit dans l'ordre, étape par étape. Chaque étape se termine par
> une case à cocher : ne passez à la suite que lorsque vous avez obtenu le
> résultat attendu.

## Objectifs de la séance

À la fin de cet atelier, vous serez capable de :

- expliquer ce qu'est un test end-to-end (E2E) et en quoi il diffère d'un test unitaire ;
- lancer une application Symfony et une suite de tests Playwright via Docker ;
- lire et comprendre un scénario de test Playwright existant ;
- écrire un nouveau scénario de test simple ;
- consulter un rapport HTML de tests et situer Playwright dans une CI.

## Pré-requis

- [ ] Docker et Docker Compose sont installés (`docker --version`, `docker compose version`).
- [ ] Docker Desktop est **démarré** (icône Docker visible dans la barre des tâches).
- [ ] Vous avez cloné le dépôt Git **ou** décompressé l'archive du projet.
- [ ] Vous disposez d'un terminal positionné à la **racine** du projet.
- [ ] *(Optionnel)* Node.js v18+ installé si vous souhaitez voir l'automation en direct (`node --version`).

---

## Étape 1 — Découvrir l'arborescence du projet

Ouvrez le projet dans votre éditeur et repérez ces éléments :

```
symfony-app/              -> l'application web à tester (Symfony, PHP 8.4)
playwright-tests/         -> les tests automatisés (Playwright 1.45)
support-formation/        -> ce guide
docker-compose.yml        -> lance l'app et les tests en conteneurs
.github/workflows/ci.yml  -> pipeline CI GitHub Actions (tests automatiques)
```

**À retenir :** l'application et les tests sont deux projets séparés, qui
communiquent uniquement via HTTP (l'un sert des pages web, l'autre clique
dans un navigateur réel). C'est exactement ce qui se passe en entreprise :
le code applicatif et le code de test évoluent souvent dans des dépôts
distincts.

Les fichiers PHP et JavaScript du projet sont **commentés ligne par ligne**
pour vous aider à comprendre le code pendant la séance.

- [ ] Je sais retrouver les dossiers principaux du projet.
- [ ] J'ai repéré le fichier `docker-compose.yml` et le workflow CI.

---

## Étape 2 — Construire et lancer l'application Symfony

Depuis la racine du projet :

```bash
docker compose build app
docker compose up -d app
```

Patientez quelques instants : Docker télécharge PHP, installe les dépendances
Symfony via **Composer** (`vendor/`) et démarre le serveur intégré.

Puis ouvrez votre navigateur sur :

```
http://localhost:8000
```

Vous devez voir une page **"Ma Todo List"** avec un champ de saisie et un
bouton "Ajouter".

Essayez manuellement :
1. Ajoutez une tâche, par exemple "Préparer le café".
2. Supprimez-la avec le bouton "Supprimer".

**En cas de problème :** vérifiez que Docker Desktop est bien lancé. Si la
page affiche une erreur, reconstruisez l'image :
`docker compose build --no-cache app && docker compose up -d app`.

- [ ] L'application Symfony est accessible sur `http://localhost:8000`.
- [ ] J'ai pu ajouter puis supprimer une tâche manuellement.

---

## Étape 3 — Comprendre ce qu'est Playwright

Playwright est un outil qui pilote un véritable navigateur (Chrome, Firefox,
Safari) pour reproduire automatiquement des actions humaines : ouvrir une
page, cliquer, remplir un formulaire, vérifier qu'un texte apparaît…

Contrairement à un test unitaire (qui teste une fonction PHP isolée),
un test Playwright vérifie le comportement **de bout en bout** : du clic de
l'utilisateur jusqu'au rendu final dans le navigateur, en passant par le
serveur Symfony.

C'est pour cela qu'on parle de test **E2E (end-to-end)**.

- [ ] Je peux expliquer en une phrase la différence entre un test unitaire et un test E2E.

---

## Étape 4 — Lancer la suite de tests fournie

Toujours à la racine du projet (avec l'app Symfony déjà démarrée) :

```bash
docker compose build playwright
docker compose run --rm playwright
```

Ce que fait cette commande :
1. Elle démarre le conteneur Playwright (connecté à l'app via le réseau Docker).
2. Playwright ouvre un navigateur **headless** (sans interface graphique).
3. Il exécute les scénarios définis dans `playwright-tests/tests/todo.spec.js`.
4. Il affiche un résumé dans le terminal (nombre de tests réussis / échoués).
5. Il génère un rapport HTML dans `playwright-tests/playwright-report/`.

Vous devriez voir une sortie similaire à :

```
Running 4 tests using 3 workers

  ✓  Scénario 1 : la page d'accueil se charge et affiche le titre
  ✓  Scénario 2 : un stagiaire ajoute une nouvelle tâche
  ✓  Scénario 3 : un stagiaire supprime une tâche existante
  ✓  Scénario 4 : un stagiaire marque une tâche comme terminée

  4 passed
```

### Consulter le rapport HTML

Depuis la racine du projet :

```bash
npx playwright show-report playwright-tests/playwright-report
```

Ou depuis le dossier `playwright-tests/` :

```bash
cd playwright-tests
npm run report
```

Une page web s'ouvre dans votre navigateur avec le détail des scénarios.

- [ ] J'ai exécuté la commande et obtenu "4 passed".
- [ ] J'ai ouvert le rapport HTML dans un navigateur.

---

## Étape 4 bis — *(Optionnel)* Voir l'automation en direct

Si Node.js est installé sur votre machine, vous pouvez **observer** les tests
dans une vraie fenêtre Chromium, ralentis pour faciliter le suivi visuel.

L'application Symfony doit rester démarrée (`docker compose up -d app`).

```bash
cd playwright-tests
npm install
npx playwright install chromium   # une seule fois, au premier lancement
npm run test:pedagogique
```

Ce script exécute les scénarios **un par un**, avec une pause de 800 ms entre
chaque action (`slowMo`).

Autres commandes utiles :
- `npm run test:headed` — navigateur visible, vitesse normale
- `npx playwright test --ui` — mode interactif pas-à-pas

- [ ] *(Optionnel)* J'ai observé au moins un scénario s'exécuter dans une fenêtre Chromium.

---

## Étape 5 — Lire un scénario pas à pas

Ouvrez le fichier `playwright-tests/tests/todo.spec.js`. Chaque ligne est
commentée pour expliquer son rôle. Concentrez-vous sur le scénario 2 :

```javascript
test('Scénario 2 : un stagiaire ajoute une nouvelle tâche', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('todo-input').fill('Réviser le Dockerfile');
  await page.getByTestId('add-button').click();

  await expect(page.getByTestId('todo-list')).toContainText('Réviser le Dockerfile');
});
```

Décortiquons chaque ligne :

| Ligne | Ce qu'elle fait |
|-------|-----------------|
| `page.goto('/')` | Ouvre la page d'accueil de l'application |
| `page.getByTestId('todo-input').fill(...)` | Cible le champ de saisie et y tape un texte |
| `page.getByTestId('add-button').click()` | Clique sur le bouton "Ajouter" |
| `expect(...).toContainText(...)` | Vérifie que le texte attendu apparaît bien à l'écran |

**Pourquoi `getByTestId` et pas un sélecteur CSS classique ?**
Parce que les attributs `data-testid="..."` dans le HTML (visibles dans
`symfony-app/templates/todo/index.html.twig`) sont stables : même si le
design change (classes CSS, structure HTML), le test continue de fonctionner
tant que l'attribut `data-testid` reste présent. C'est une bonne pratique
très répandue en entreprise.

Consultez aussi `playwright.config.js` (commenté) pour comprendre la
`baseURL`, les rapports HTML et le mode CI.

- [ ] Je peux expliquer ce que fait chaque ligne du scénario 2.
- [ ] J'ai localisé les attributs `data-testid` dans le template Twig.

---

## Étape 6 — Exercice : écrire votre propre scénario

À vous ! Ajoutez un nouveau test dans `playwright-tests/tests/todo.spec.js`,
juste après le scénario 3, qui vérifie le comportement suivant :

> Lorsqu'on n'a ajouté aucune tâche, la liste affiche le message
> "Aucune tâche pour le moment" (attribut `data-testid="empty-state"`).

**Indices :**
- Le message vide est visible uniquement quand la liste de tâches est
  réellement vide. Réfléchissez à l'ordre des actions dans votre test.
- Vous pouvez vous inspirer de la structure des scénarios 1 à 3.
- Pensez à relancer `docker compose run --rm playwright` pour vérifier votre
  test.

<details>
<summary>Solution proposée (à ne consulter qu'après avoir essayé)</summary>

```javascript
test('Scénario bonus : message affiché quand la liste est vide', async ({ page }) => {
  await page.goto('/');

  // Selon l'état de la session, on s'assure d'abord que la liste est vide
  // en supprimant toutes les tâches existantes si besoin.
  const deleteButtons = page.getByTestId('delete-button');
  while (await deleteButtons.count() > 0) {
    await deleteButtons.first().click();
  }

  await expect(page.getByTestId('empty-state')).toHaveText('Aucune tâche pour le moment');
});
```

</details>

- [ ] Mon nouveau test passe quand je lance la suite Playwright.

---

## Étape 7 — Intégration continue et aller plus loin

### CI GitHub Actions (déjà configurée)

Ce projet inclut un pipeline CI dans `.github/workflows/ci.yml`. À chaque push
sur la branche `main`, GitHub exécute automatiquement :

1. Le build Docker de l'app Symfony et de Playwright
2. Les scénarios E2E en mode headless
3. La publication du rapport HTML en **artefact** téléchargeable

Pour consulter un rapport généré par la CI :
1. Onglet **Actions** du dépôt GitHub
2. Cliquer sur l'exécution souhaitée
3. Télécharger l'artefact **`playwright-report`**
4. Décompresser et ouvrir `index.html`

Le fichier `ci.yml` est commenté ligne par ligne : c'est un bon support pour
comprendre comment automatiser les tests en entreprise.

### Autres pistes

- **Captures d'écran et traces** : en cas d'échec, Playwright génère
  automatiquement une capture d'écran (configuré dans `playwright.config.js`
  via `screenshot: 'only-on-failure'`).
- **Mode debug visuel** : `npm run test:pedagogique` ou `npx playwright test --ui`
  (voir étape 4 bis).
- **Reproduire la CI en local** :
  ```bash
  CI=true docker compose build
  docker compose up -d app
  CI=true docker compose run --rm playwright
  docker compose down -v
  ```

- [ ] Je sais où trouver le workflow CI et le rapport HTML sur GitHub Actions.
- [ ] Je connais au moins une commande pour voir l'automation en direct.

---

## Récapitulatif

| Étape | Compétence acquise |
|-------|---------------------|
| 1-2 | Démarrer une application Symfony dockerisée |
| 3 | Définir un test E2E |
| 4 | Exécuter une suite de tests Playwright via Docker |
| 4 bis | Observer l'automation en direct (optionnel) |
| 5 | Lire et comprendre un scénario existant |
| 6 | Écrire un scénario de test simple |
| 7 | Situer Playwright dans une démarche CI/CD |

## Glossaire express

- **E2E (end-to-end)** : test qui valide un parcours complet, de l'interface
  utilisateur jusqu'au serveur.
- **Headless** : navigateur piloté sans interface graphique affichée.
- **`data-testid`** : attribut HTML dédié uniquement aux tests, indépendant
  du style visuel.
- **Assertion (`expect`)** : vérification qui fait échouer le test si elle
  n'est pas respectée.
- **`slowMo`** : option Playwright qui ralentit l'automation entre chaque action.
- **Artefact (CI)** : fichier archivé par la CI (ici, le rapport HTML Playwright).
- **CI (Continuous Integration)** : exécution automatique des tests à chaque
  modification du code.

## Dépannage rapide

| Problème | Solution |
|----------|----------|
| Docker ne répond pas | Démarrer Docker Desktop |
| `No report found` avec `show-report` | Utiliser `npx playwright show-report playwright-tests/playwright-report` depuis la racine |
| Navigateur Playwright introuvable (local) | `npx playwright install chromium` dans `playwright-tests/` |
| Erreur 500 sur localhost:8000 | `docker compose build --no-cache app && docker compose up -d app` |
