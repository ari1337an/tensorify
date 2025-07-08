# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and config in one layer
COPY package*.json tsconfig.json ./

# Copy source code and scripts in one layer
COPY src/ src/
COPY scripts/ scripts/

# Install all dependencies, build, then prune dev dependencies
RUN npm install && \
    npm run build && \
    npm prune --production && \
    npm cache clean --force && \
    mkdir -p logs

# Production stage
FROM gcr.io/distroless/nodejs20-debian12 AS production

# Set working directory
WORKDIR /app

# Copy package files and ecosystem config
COPY package*.json ecosystem.config.js ./

# Copy pruned node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder /app/dist/ dist/

# Copy logs directory from builder stage
COPY --from=builder /app/logs/ logs/

# Expose port
EXPOSE 3001

# Start the application with PM2 runtime directly
CMD ["dist", "index.js"]