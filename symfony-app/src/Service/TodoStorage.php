<?php // Début du fichier PHP

// Espace de noms : regroupe les services métier de l'application
namespace App\Service;

// Importe le composant Symfony qui donne accès à la session HTTP
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Stockage très simple des tâches en session.
 * Volontairement minimaliste : pas de base de données,
 * pour garder le projet de formation léger et 100% autonome.
 */
// Service responsable de lire, ajouter et supprimer les tâches en session
class TodoStorage
{
    // Clé utilisée pour stocker le tableau de tâches dans la session
    private const SESSION_KEY = 'todos';

    // Symfony injecte automatiquement le RequestStack via le constructeur
    public function __construct(private RequestStack $requestStack)
    {
    }

    // Retourne toutes les tâches enregistrées (tableau vide si aucune tâche)
    public function all(): array
    {
        return $this->session()->get(self::SESSION_KEY, []);
    }

    // Ajoute une nouvelle tâche avec un identifiant auto-incrémenté
    public function add(string $label): void
    {
        // Récupère l'état actuel de la liste
        $todos = $this->all();
        // Calcule le prochain identifiant (1 si la liste est vide, sinon max + 1)
        $nextId = $todos === [] ? 1 : (max(array_column($todos, 'id')) + 1);

        // Ajoute la nouvelle tâche au tableau (non terminée par défaut)
        $todos[] = ['id' => $nextId, 'label' => $label, 'done' => false];
        // Persiste le tableau mis à jour dans la session
        $this->session()->set(self::SESSION_KEY, $todos);
    }

    // Supprime une tâche par son identifiant
    public function remove(int $id): void
    {
        // Filtre le tableau pour exclure la tâche dont l'id correspond
        $todos = array_values(array_filter(
            $this->all(),
            static fn (array $todo): bool => $todo['id'] !== $id
        ));

        // Réindexe et sauvegarde la liste filtrée dans la session
        $this->session()->set(self::SESSION_KEY, $todos);
    }

    // Bascule l'état "terminée" d'une tâche (terminée ↔ en cours)
    public function toggle(int $id): void
    {
        // Récupère toutes les tâches pour modifier celle ciblée
        $todos = $this->all();

        // Parcourt le tableau et inverse le booléen done de la tâche correspondante
        foreach ($todos as &$todo) {
            if ($todo['id'] === $id) {
                $todo['done'] = !($todo['done'] ?? false);
                break;
            }
        }
        unset($todo);

        // Persiste la liste mise à jour dans la session
        $this->session()->set(self::SESSION_KEY, $todos);
    }

    // Méthode utilitaire : retourne l'objet session de la requête courante
    private function session()
    {
        return $this->requestStack->getSession();
    }
}
