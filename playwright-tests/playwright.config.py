# Importe les utilitaires de configuration
import os
from typing import Any


def define_config(**options: Any) -> dict[str, Any]:
    """Équivalent Python de defineConfig() — retourne un dictionnaire de configuration."""
    return options


# Exporte la configuration Playwright utilisée par toutes les commandes pytest
config = define_config(
    # Dossier contenant les fichiers de test (*.spec.py)
    test_dir='./tests',
    # Lance les tests en parallèle quand plusieurs workers sont disponibles
    fully_parallel=True,
    # En CI, interdit les tests marqués @pytest.mark.only (évite de lancer un seul test par erreur)
    forbid_only=bool(os.environ.get('CI')),
    # En CI, réessaie une fois en cas d'échec ; en local, aucune nouvelle tentative
    retries=1 if os.environ.get('CI') else 0,
    # Formats de rapport générés après l'exécution des tests
    reporter=[
        # Affiche la progression dans le terminal
        'list',
        # Génère un rapport HTML consultable dans playwright-report/
        ['html', {'output_folder': 'playwright-report', 'open': 'never'}],
    ],
    # Options communes appliquées à chaque test
    use={
        # URL de base de l'application Symfony (Docker ou local)
        'base_url': os.environ.get('PLAYWRIGHT_BASE_URL', 'http://localhost:8000'),
        # Options de lancement du navigateur Chromium
        'launch_options': {
            # Ralentit l'automation si PLAYWRIGHT_SLOW_MO est défini (mode pédagogique)
            'slow_mo': int(os.environ['PLAYWRIGHT_SLOW_MO'])
            if os.environ.get('PLAYWRIGHT_SLOW_MO')
            else 0,
        },
        # Enregistre une trace détaillée uniquement lors d'une nouvelle tentative
        'trace': 'on-first-retry',
        # Prend une capture d'écran uniquement en cas d'échec
        'screenshot': 'only-on-failure',
    },
    # Liste des navigateurs / profils sur lesquels exécuter les tests
    projects=[
        {
            # Nom du projet affiché dans les rapports
            'name': 'chromium',
            # Simule un Chrome de bureau avec une taille d'écran standard
            'use': {'device': 'Desktop Chrome'},
        },
    ],
)
