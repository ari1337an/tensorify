# Single-stage build for simplicity
FROM node:20-bookworm-slim

# Set working directory
WORKDIR /app

# Copy package files and scripts
COPY package*.json ./
COPY scripts/ scripts/
COPY tsconfig.json ./
COPY ecosystem.config.js ./

# Install all dependencies, build, then remove dev dependencies
RUN npm install

# Copy source code
COPY src/ src/

# Build the application
RUN npm run build

# Create logs directory for PM2
RUN mkdir -p logs

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Clear npm cache
RUN npm cache clean --force

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application with PM2 in no-daemon mode for Docker
CMD ["npm", "run", "start:docker"]   