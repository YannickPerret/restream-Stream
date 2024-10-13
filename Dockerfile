# Utiliser une image de base officielle de Node.js
FROM node:18-alpine AS base
LABEL authors="tchoune"

# Installer pnpm
RUN npm install -g pnpm

# Installer les dépendances seulement quand c'est nécessaire
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier package.json et pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Copier les fichiers de polices et autres fichiers publics
COPY public /app/public

# Désactiver la télémétrie pendant la construction
ENV NEXT_TELEMETRY_DISABLED=1

# Construire l'application
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_TWITCH_CLIENT_ID
ARG NEXT_PUBLIC_TWITCH_CLIENT_SECRET
ENV NEXT_PUBLIC_SITE_NAME=Coffee-Stream
ENV NEXT_PUBLIC_BASE_URL=https://beyondspeedrun.com
ENV NEXT_PUBLIC_TWITCH_CLIENT_ID=5f2rol52paw8p9ci6zlklozgv154u5
ENV NEXT_PUBLIC_TWITCH_CLIENT_SECRET=rnnsux585itsthxeicxmyk4omydm41

RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Ajouter l'utilisateur nextjs
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copier les fichiers nécessaires depuis l'étape de construction
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
