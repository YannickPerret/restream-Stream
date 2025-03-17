FROM node:20.12.2-bullseye

WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

EXPOSE 3333
CMD ["pnpm", "run", "dev"]
