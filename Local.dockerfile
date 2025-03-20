FROM node:20.12.2-bullseye

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Set pnpm store directory outside of /app and configure it
ENV PNPM_HOME=/pnpm-store
RUN mkdir -p $PNPM_HOME && pnpm config set store-dir $PNPM_HOME

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy the rest of the application
COPY . .

# Set permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3331

# Default command for development
CMD ["pnpm", "run", "dev"]
