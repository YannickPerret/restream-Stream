FROM node:20.12.2-alpine3.18 AS base

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


# Stage de production
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
EXPOSE 3333
CMD ["node", "build/bin/server.js"]
