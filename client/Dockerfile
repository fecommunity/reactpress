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
RUN echo "=== client/package.json exists? ===" && test -f client/package.json && echo "YES" || echo "NO"

# Install dependencies - ALWAYS use --no-frozen-lockfile to avoid issues
RUN pnpm install --no-frozen-lockfile

# Build the client application
WORKDIR /app/client
RUN pnpm run build

# Expose port
EXPOSE 3001

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Start the application
CMD ["pnpm", "run", "start"]