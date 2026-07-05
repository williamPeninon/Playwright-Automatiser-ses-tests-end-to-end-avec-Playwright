<?php

namespace App\Controller;

use App\Service\TodoStorage;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TodoController extends AbstractController
{
    #[Route('/', name: 'todo_index', methods: ['GET'])]
    public function index(TodoStorage $storage): Response
    {
        return $this->render('todo/index.html.twig', [
            'todos' => $storage->all(),
        ]);
    }

    #[Route('/add', name: 'todo_add', methods: ['POST'])]
    public function add(Request $request, TodoStorage $storage): RedirectResponse
    {
        $label = trim((string) $request->request->get('label', ''));

        if ($label !== '') {
            $storage->add($label);
        }

        return $this->redirectToRoute('todo_index');
    }

    #[Route('/delete/{id}', name: 'todo_delete', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function delete(int $id, TodoStorage $storage): RedirectResponse
    {
        $storage->remove($id);

        return $this->redirectToRoute('todo_index');
    }
}
