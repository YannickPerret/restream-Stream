# Base stage avec node et pnpm
FROM node:20.12.2-alpine3.18 as base
RUN npm install -g pnpm

# Stage pour les dépendances
FROM base as deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Stage pour les dépendances de production uniquement
FROM base as production-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --no-optional

# Stage pour la construction de l'application
FROM base as build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm run build --ignore-ts-errors

# Vérifier les fichiers générés
RUN ls -la /app/build

# Stage de production
FROM base as production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
EXPOSE 3333
CMD ["node", "build/bin/server.js"]
