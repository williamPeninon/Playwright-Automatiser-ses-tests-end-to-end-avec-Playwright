<?php // Début du fichier PHP

// Espace de noms : regroupe les classes du contrôleur de l'application
namespace App\Controller;

// Importe le service qui gère le stockage des tâches en session
use App\Service\TodoStorage;
// Importe la classe de base des contrôleurs Symfony
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
// Importe la réponse HTTP de type redirection
use Symfony\Component\HttpFoundation\RedirectResponse;
// Importe l'objet représentant la requête HTTP entrante
use Symfony\Component\HttpFoundation\Request;
// Importe la réponse HTTP standard (page HTML)
use Symfony\Component\HttpFoundation\Response;
// Importe l'attribut PHP pour déclarer les routes
use Symfony\Component\Routing\Annotation\Route;

// Contrôleur principal de la Todo List : affichage, ajout, suppression et statut terminé
class TodoController extends AbstractController
{
    // Route GET / : affiche la page d'accueil avec la liste des tâches
    #[Route('/', name: 'todo_index', methods: ['GET'])]
    public function index(TodoStorage $storage): Response
    {
        // Rend le template Twig en lui passant toutes les tâches stockées
        return $this->render('todo/index.html.twig', [
            'todos' => $storage->all(),
        ]);
    }

    // Route POST /add : reçoit le formulaire d'ajout d'une nouvelle tâche
    #[Route('/add', name: 'todo_add', methods: ['POST'])]
    public function add(Request $request, TodoStorage $storage): RedirectResponse
    {
        // Récupère et nettoie le texte saisi dans le champ "label" du formulaire
        $label = trim((string) $request->request->get('label', ''));

        // N'ajoute la tâche que si le libellé n'est pas vide
        if ($label !== '') {
            $storage->add($label);
        }

        // Redirige vers la page d'accueil pour afficher la liste mise à jour
        return $this->redirectToRoute('todo_index');
    }

    // Route POST /delete/{id} : supprime une tâche par son identifiant numérique
    #[Route('/delete/{id}', name: 'todo_delete', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function delete(int $id, TodoStorage $storage): RedirectResponse
    {
        // Supprime la tâche correspondante de la session
        $storage->remove($id);

        // Redirige vers la page d'accueil pour afficher la liste mise à jour
        return $this->redirectToRoute('todo_index');
    }

    // Route POST /toggle/{id} : bascule l'état terminé / en cours d'une tâche
    #[Route('/toggle/{id}', name: 'todo_toggle', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function toggle(int $id, TodoStorage $storage): RedirectResponse
    {
        // Inverse le statut "terminée" de la tâche identifiée
        $storage->toggle($id);

        // Redirige vers la page d'accueil pour afficher la liste mise à jour
        return $this->redirectToRoute('todo_index');
    }
}
