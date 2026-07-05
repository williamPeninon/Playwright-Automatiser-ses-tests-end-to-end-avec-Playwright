<?php // Point d'entrée HTTP de l'application Symfony

// Importe la classe Kernel qui démarre le framework
use App\Kernel;

// Charge l'autoloader Composer et le runtime Symfony
require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

// Retourne une fonction appelée par Symfony pour créer le noyau de l'application
return function (array $context) {
    // Instancie le Kernel avec l'environnement (dev/prod) et le mode debug
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
