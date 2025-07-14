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
    npx turbo build  --filter=@tensorify.io/backend-api && \
    npm prune --production --legacy-peer-deps && \
    npm cache clean --force

# Production stage - Ultra optimized
FROM ari1337an/node-20-python3-make-cpp:0.0.2 AS production

# Single RUN command to minimize layers and clean up in same layer
RUN addgroup -g 1001 -S nodejs && \
    adduser -S api -u 1001 && \
    # Clean package caches and unnecessary files
    rm -rf /var/cache/apk/* \
           /tmp/* \
           /var/tmp/* \
           /usr/share/man \
           /usr/share/doc \
           /usr/share/info \
           /usr/share/locale \
           /usr/share/terminfo \
           /root/.cache \
           /root/.npm \
           /home/*/.cache \
           /home/*/.npm && \
    # Remove unnecessary Python packages and cache
    find /usr/lib/python* -name "*.pyc" -delete && \
    find /usr/lib/python* -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# Set working directory
WORKDIR /app

# Copy only essential files with specific paths (avoid directory overhead)
COPY --from=builder /app/services/api/package.json ./package.json
COPY --from=builder /app/services/api/ecosystem.config.js ./ecosystem.config.js

# Copy minimal node_modules - only production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy built application with specific structure
COPY --from=builder /app/services/api/dist/ ./dist/

# Copy plugin-engine with minimal structure (only what's needed)
COPY --from=builder /app/packages/plugin-engine/package.json ./node_modules/@tensorify.io/plugin-engine/package.json
COPY --from=builder /app/packages/plugin-engine/dist/ ./node_modules/@tensorify.io/plugin-engine/dist/

# Create minimal logs directory
RUN mkdir -p logs && \
    # Final cleanup in same layer to minimize image size
    npm cache clean --force && \
    rm -rf /tmp/* \
           /var/tmp/* \
           /root/.cache \
           /root/.npm \
           ~/.cache \
           ~/.npm && \
    # Strip binaries to remove debug symbols (reduce size)
    find /app/node_modules -name "*.node" -exec strip {} \; 2>/dev/null || true && \
    # Remove source maps and unnecessary files from node_modules
    find /app/node_modules -name "*.map" -delete && \
    find /app/node_modules -name "*.md" -delete && \
    find /app/node_modules -name "*.txt" -delete && \
    find /app/node_modules -name "CHANGELOG*" -delete && \
    find /app/node_modules -name "README*" -delete && \
    find /app/node_modules -name "LICENSE*" -delete && \
    find /app/node_modules -name "*.d.ts" -delete && \
    find /app/node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find /app/node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find /app/node_modules -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find /app/node_modules -name "examples" -type d -exec rm -rf {} + 2>/dev/null || true && \
    find /app/node_modules -name ".github" -type d -exec rm -rf {} + 2>/dev/null || true && \
    # Change ownership efficiently
    chown -R api:nodejs /app

# Switch to non-root user
USER api

# Expose port
EXPOSE 3001

# Start application directly with minimal overhead
CMD ["node", "--no-node-snapshot", "dist/index.js"]