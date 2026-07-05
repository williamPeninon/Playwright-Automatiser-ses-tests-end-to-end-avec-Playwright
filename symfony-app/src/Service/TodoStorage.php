<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Stockage très simple des tâches en session.
 * Volontairement minimaliste : pas de base de données,
 * pour garder le projet de formation léger et 100% autonome.
 */
class TodoStorage
{
    private const SESSION_KEY = 'todos';

    public function __construct(private RequestStack $requestStack)
    {
    }

    public function all(): array
    {
        return $this->session()->get(self::SESSION_KEY, []);
    }

    public function add(string $label): void
    {
        $todos = $this->all();
        $nextId = $todos === [] ? 1 : (max(array_column($todos, 'id')) + 1);

        $todos[] = ['id' => $nextId, 'label' => $label];
        $this->session()->set(self::SESSION_KEY, $todos);
    }

    public function remove(int $id): void
    {
        $todos = array_values(array_filter(
            $this->all(),
            static fn (array $todo): bool => $todo['id'] !== $id
        ));

        $this->session()->set(self::SESSION_KEY, $todos);
    }

    private function session()
    {
        return $this->requestStack->getSession();
    }
}
