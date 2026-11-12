# Image officielle Playwright : Node.js + Chromium, Firefox et WebKit + dépendances Linux.
# La version de l'image DOIT être identique à celle de @playwright/test dans package.json,
# sinon les navigateurs embarqués ne correspondent pas ("Executable doesn't exist").
FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

# Installation reproductible des dépendances (package-lock.json)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
