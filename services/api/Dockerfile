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

# Copy all source code
COPY packages/plugin-engine/ ./packages/plugin-engine/
COPY services/api/src/ ./services/api/src/
COPY services/api/scripts/ ./services/api/scripts/
COPY services/api/tsconfig.json ./services/api/
COPY services/api/ecosystem.config.js ./services/api/

# Install dependencies for the entire workspace
RUN npm install --workspace=@tensorify.io/backend-api --legacy-peer-deps && \
    npx turbo build --filter=@tensorify.io/backend-api && \
    npm prune --production --legacy-peer-deps && \
    npm cache clean --force

# Production stage - Ultra optimized
FROM ari1337an/node-20-python3-make-cpp:0.0.2 AS production

# Set working directory
WORKDIR /app

# Copy everything exactly as built
COPY --from=builder /app .

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "--no-node-snapshot", "services/api/dist/index.js"]