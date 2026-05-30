FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install --no-frozen-lockfile

WORKDIR /app/themes/twentytwentyfive
RUN pnpm run build

EXPOSE 3001

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

CMD ["pnpm", "run", "start"]
