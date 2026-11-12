<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Stockage très simple des tâches en session.
 *
 * Volontairement minimaliste : pas de base de données, pour garder le projet
 * de formation léger et 100 % autonome.
 *
 * Conséquence importante pour les tests Playwright : chaque test reçoit un
 * nouveau "browser context" (cookies vides) donc une nouvelle session PHP,
 * donc une liste de tâches vide. Les tests sont isolés par construction.
 */
class TodoStorage
{
    private const SESSION_KEY = 'todos';

    public const PRIORITIES = ['basse' => 'Basse', 'normale' => 'Normale', 'haute' => 'Haute'];

    public function __construct(private RequestStack $requestStack)
    {
    }

    /**
     * @return list<array{id:int,label:string,priority:string,done:bool}>
     */
    public function all(): array
    {
        return $this->session()->get(self::SESSION_KEY, []);
    }

    /**
     * @param 'all'|'active'|'done' $filter
     */
    public function filtered(string $filter): array
    {
        return match ($filter) {
            'active' => array_values(array_filter($this->all(), static fn (array $t): bool => !$t['done'])),
            'done' => array_values(array_filter($this->all(), static fn (array $t): bool => $t['done'])),
            default => $this->all(),
        };
    }

    public function add(string $label, string $priority = 'normale'): void
    {
        $todos = $this->all();
        $nextId = $todos === [] ? 1 : (max(array_column($todos, 'id')) + 1);

        if (!array_key_exists($priority, self::PRIORITIES)) {
            $priority = 'normale';
        }

        $todos[] = ['id' => $nextId, 'label' => $label, 'priority' => $priority, 'done' => false];
        $this->save($todos);
    }

    public function toggle(int $id): void
    {
        $todos = array_map(
            static fn (array $todo): array => $todo['id'] === $id ? ['done' => !$todo['done']] + $todo : $todo,
            $this->all()
        );

        $this->save($todos);
    }

    public function remove(int $id): void
    {
        $this->save(array_values(array_filter(
            $this->all(),
            static fn (array $todo): bool => $todo['id'] !== $id
        )));
    }

    public function clear(): void
    {
        $this->save([]);
    }

    /**
     * @return array{total:int,done:int,remaining:int}
     */
    public function stats(): array
    {
        $total = count($this->all());
        $done = count($this->filtered('done'));

        return ['total' => $total, 'done' => $done, 'remaining' => $total - $done];
    }

    private function save(array $todos): void
    {
        $this->session()->set(self::SESSION_KEY, $todos);
    }

    private function session(): SessionInterface
    {
        return $this->requestStack->getSession();
    }
}
