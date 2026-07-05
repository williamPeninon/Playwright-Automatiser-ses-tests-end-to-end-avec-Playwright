# Étape 1 : installation des dépendances PHP via Composer
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-interaction --no-scripts --prefer-dist --no-dev

# Étape 2 : image d'exécution
FROM php:8.4-cli

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libzip-dev zip \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=vendor /app/vendor ./vendor
COPY . .

EXPOSE 8000

# Serveur PHP intégré : suffisant pour un environnement de formation,
# à ne jamais utiliser tel quel en production.
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
