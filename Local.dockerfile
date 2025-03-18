FROM node:20.12.2-bullseye

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV PNPM_HOME=/pnpm-store
RUN mkdir -p $PNPM_HOME && pnpm config set store-dir $PNPM_HOME

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --shamefully-hoist

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 3333

CMD ["pnpm", "dev"]
