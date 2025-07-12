# Build stage
FROM node:20.13.1-alpine AS builder

# Set working directory
WORKDIR /app

# Copy monorepo config files
COPY package.json ./
COPY package-lock.json ./
COPY turbo.json ./

# Copy only the target service's source code
COPY services/plugins.tensorify.io/ ./services/plugins.tensorify.io/

RUN npm pkg delete packageManager && npm pkg set packageManager="npm@10.8.1" && \
    npm ci --legacy-peer-deps --workspace=@tensorify/plugins.tensorify.io && \
    cd services/plugins.tensorify.io && npx prisma generate && \
    cd ../.. && \
    npx turbo build --filter=@tensorify/plugins.tensorify.io && \
    npm prune --production --legacy-peer-deps --workspace=@tensorify/plugins.tensorify.io && \
    rm -rf /app/services/plugins.tensorify.io/{src,app,pages,tests,test,__tests__} \
    && rm -rf /app/services/plugins.tensorify.io/.next/cache \
    && rm -rf /app/node_modules/.cache \
    && rm -rf /app/.turbo \
    && find /app -name "*.ts" -delete \
    && find /app -name "*.tsx" -delete \
    && find /app -name "tsconfig.json" -delete

# Production stage - Ultra optimized
FROM gcr.io/distroless/nodejs20-debian12 AS production

# Set root working directory
WORKDIR /app

# Copy only necessary runtime artifacts from builder
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/services/plugins.tensorify.io/.next /app/services/plugins.tensorify.io/.next
COPY --from=builder /app/services/plugins.tensorify.io/node_modules /app/services/plugins.tensorify.io/node_modules
COPY --from=builder /app/services/plugins.tensorify.io/package.json /app/services/plugins.tensorify.io/package.json

# Set working directory to the service
WORKDIR /app/services/plugins.tensorify.io

# Expose port
EXPOSE 3000

# Start application directly
CMD ["../../node_modules/next/dist/bin/next", "start"]