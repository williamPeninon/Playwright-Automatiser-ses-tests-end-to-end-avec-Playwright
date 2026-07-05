<?php // Début du fichier PHP

// Espace de noms racine de l'application
namespace App;

// Importe le trait qui configure automatiquement les routes, services et bundles
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
// Importe la classe Kernel de base fournie par Symfony
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

// Noyau de l'application : point central qui démarre Symfony
class Kernel extends BaseKernel
{
    // Active la configuration simplifiée adaptée aux petits projets Symfony
    use MicroKernelTrait;
}
