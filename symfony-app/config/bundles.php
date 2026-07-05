<?php // Début du fichier PHP

// Importe le bundle principal Symfony (routing, HTTP, session, etc.)
use Symfony\Bundle\FrameworkBundle\FrameworkBundle;
// Importe le bundle Twig pour le rendu des templates HTML
use Symfony\Bundle\TwigBundle\TwigBundle;

// Retourne la liste des bundles activés selon l'environnement d'exécution
return [
    // FrameworkBundle est actif dans tous les environnements (dev, prod, test)
    FrameworkBundle::class => ['all' => true],
    // TwigBundle est actif dans tous les environnements (dev, prod, test)
    TwigBundle::class => ['all' => true],
];
