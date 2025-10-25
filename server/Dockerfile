# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy ALL files from the project root
COPY . .

# Debug: Show what files were copied
RUN echo "=== Files in /app ===" && ls -la
RUN echo "=== pnpm-lock.yaml exists? ===" && test -f pnpm-lock.yaml && echo "YES" || echo "NO"
RUN echo "=== pnpm-workspace.yaml exists? ===" && test -f pnpm-workspace.yaml && echo "YES" || echo "NO"
RUN echo "=== server/package.json exists? ===" && test -f server/package.json && echo "YES" || echo "NO"

# Install dependencies - ALWAYS use --no-frozen-lockfile to avoid issues
RUN pnpm install --no-frozen-lockfile

# Build the server application
WORKDIR /app/server
RUN pnpm run build

# Expose port
EXPOSE 3002

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Start the application
CMD ["pnpm", "run", "start"]