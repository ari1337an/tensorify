# Build stage
FROM ari1337an/node-20-python3-make-cpp:0.0.2 AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy workspace configuration
COPY package*.json pnpm-workspace.yaml .npmrc turbo.json pnpm-lock.yaml ./

# Copy all workspace packages and services
COPY packages/ ./packages/
COPY services/ ./services/

# Install dependencies and build (the ... means the backend-api AND its workspace dependencies)
RUN pnpm install --frozen-lockfile --filter=@tensorify.io/backend-api... 
RUN pnpm build --filter=@tensorify.io/backend-api...

# Deploy stage - Create portable package with pnpm deploy
FROM ari1337an/node-20-python3-make-cpp:0.0.2 AS deployed

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy the entire workspace for deployment
COPY --from=builder /app .

# Use pnpm deploy to create a portable package
RUN pnpm --filter=@tensorify.io/backend-api --prod deploy deployed

# Production stage - Ultra optimized
FROM ari1337an/node-20-python3-make-cpp:0.0.2 AS production

# Install PM2 globally and curl for health checks, then clean up
RUN npm install -g pm2@latest && \
    npm cache clean --force && \
    apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy the deployed package (contains everything needed to run)
COPY --from=deployed /app/deployed .

# Create logs directory for PM2
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application with PM2 using ecosystem config
# PM2 will handle the --no-node-snapshot argument via ecosystem.config.js
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]