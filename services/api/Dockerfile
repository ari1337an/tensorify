# Build stage
FROM ari1337an/node-20-python3-make-cpp:0.0.2 AS builder

# Set working directory
WORKDIR /app

# Copy workspace configuration first for better caching
COPY package*.json turbo.json ./

# Copy workspace packages needed for dependencies
COPY packages/plugin-engine/package.json ./packages/plugin-engine/

# Copy API service package.json
COPY services/api/package.json ./services/api/

# Install dependencies for the entire workspace
RUN npm install --workspace=@tensorify.io/backend-api --legacy-peer-deps

# Copy all source code
COPY packages/plugin-engine/ ./packages/plugin-engine/
COPY services/api/src/ ./services/api/src/
COPY services/api/scripts/ ./services/api/scripts/
COPY services/api/tsconfig.json ./services/api/
COPY services/api/ecosystem.config.js ./services/api/

# Build the application and prune dev dependencies
RUN npx turbo build --filter=@tensorify.io/backend-api && \
    npm prune --production --workspace=@tensorify.io/backend-api --legacy-peer-deps && \
    npm cache clean --force

# Production stage - Ultra optimized
FROM ari1337an/node-20-python3-make-cpp:0.0.2 AS production

# Install PM2 globally and curl for health checks, then clean up
RUN npm install -g pm2@latest && \
    npm cache clean --force && \
    apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy only the built application and necessary files
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/services/api/ecosystem.config.js ./services/api/
COPY --from=builder /app/services/api/package.json ./services/api/
COPY --from=builder /app/node_modules ./node_modules
# Only copy the built packages we need (not source)
COPY --from=builder /app/packages/plugin-engine/lib ./packages/plugin-engine/lib
COPY --from=builder /app/packages/plugin-engine/package.json ./packages/plugin-engine/
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Create logs directory for PM2
RUN mkdir -p /app/services/api/logs

# Set working directory to API service
WORKDIR /app/services/api

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application with PM2 using ecosystem config
# PM2 will handle the --no-node-snapshot argument via ecosystem.config.js
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]