<?php

namespace App\Controller;

use App\Service\TodoStorage;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Contrôleur unique de la Todo List de formation.
 *
 * Chaque route correspond à un comportement testé pendant la formation :
 *   GET  /                 -> liste (+ filtre ?filter=all|active|done)  [Jour 1]
 *   POST /add              -> ajout d'une tâche avec priorité (select)  [Jour 1]
 *   POST /toggle/{id}      -> terminer / réouvrir une tâche             [Jour 1]
 *   POST /delete/{id}      -> suppression                               [Jour 1]
 *   POST /clear            -> vider la liste (confirmation JS)          [Jour 1 - dialogues]
 *   GET  /api/stats        -> statistiques JSON, réponse volontairement lente [Jour 1 - synchro]
 */
class TodoController extends AbstractController
{
    private const FILTERS = ['all', 'active', 'done'];

    #[Route('/', name: 'todo_index', methods: ['GET'])]
    public function index(Request $request, TodoStorage $storage): Response
    {
        $filter = (string) $request->query->get('filter', 'all');
        if (!in_array($filter, self::FILTERS, true)) {
            $filter = 'all';
        }

        return $this->render('todo/index.html.twig', [
            'todos' => $storage->filtered($filter),
            'filter' => $filter,
            'stats' => $storage->stats(),
            'priorities' => TodoStorage::PRIORITIES,
        ]);
    }

    #[Route('/add', name: 'todo_add', methods: ['POST'])]
    public function add(Request $request, TodoStorage $storage): RedirectResponse
    {
        $label = trim((string) $request->request->get('label', ''));
        $priority = (string) $request->request->get('priority', 'normale');

        if ($label !== '') {
            $storage->add($label, $priority);
            $this->addFlash('success', sprintf('Tâche « %s » ajoutée', $label));
        }

        return $this->redirectToRoute('todo_index');
    }

    #[Route('/toggle/{id}', name: 'todo_toggle', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function toggle(int $id, Request $request, TodoStorage $storage): RedirectResponse
    {
        $storage->toggle($id);

        return $this->redirectToRoute('todo_index', ['filter' => $request->query->get('filter', 'all')]);
    }

    #[Route('/delete/{id}', name: 'todo_delete', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function delete(int $id, TodoStorage $storage): RedirectResponse
    {
        $storage->remove($id);
        $this->addFlash('success', 'Tâche supprimée');

        return $this->redirectToRoute('todo_index');
    }

    #[Route('/clear', name: 'todo_clear', methods: ['POST'])]
    public function clear(TodoStorage $storage): RedirectResponse
    {
        $storage->clear();
        $this->addFlash('success', 'Liste vidée');

        return $this->redirectToRoute('todo_index');
    }

    /**
     * Statistiques chargées en AJAX par la page d'accueil.
     * Le délai aléatoire (0,5 à 2 s) simule un back-end lent : c'est le support
     * des exercices sur la synchronisation (auto-attente, pas de waitForTimeout).
     */
    #[Route('/api/stats', name: 'api_stats', methods: ['GET'])]
    public function stats(Request $request, TodoStorage $storage): JsonResponse
    {
        $stats = $storage->stats();
        // On libère le verrou de session AVANT d'attendre, sinon les autres
        // requêtes du même navigateur (ajout, suppression...) seraient bloquées.
        $request->getSession()->save();

        usleep(random_int(500, 2000) * 1000);

        return $this->json($stats);
    }
}
