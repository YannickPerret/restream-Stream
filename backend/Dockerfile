# Utilisez l'image Docker pré-construite avec GStreamer
FROM tchoune/corebase:latest AS base

RUN npm install -g pnpm

# Stage pour les dépendances
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Stage pour les dépendances de production uniquement
FROM base AS production-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --no-optional

# Stage pour la construction de l'application
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm run build --ignore-ts-errors

# Vérifier les fichiers générés
RUN ls -la /app/build

# Stage de production
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
EXPOSE 3333
CMD ["node", "build/bin/server.js"]

# Stage pour le développement
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
EXPOSE 3333
CMD ["pnpm", "dev"]
