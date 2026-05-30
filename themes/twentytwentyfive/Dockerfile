FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY toolkit/package.json ./toolkit/
COPY themes/twentytwentyfive/package.json ./themes/twentytwentyfive/
COPY themes/hello-world/package.json ./themes/hello-world/
COPY server/package.json ./server/
COPY cli/package.json ./cli/
COPY web/package.json ./web/

RUN pnpm install --frozen-lockfile

COPY toolkit ./toolkit
COPY themes/twentytwentyfive ./themes/twentytwentyfive

RUN pnpm run --dir toolkit build
WORKDIR /app/themes/twentytwentyfive
RUN pnpm run build

EXPOSE 3001

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

USER nextjs

CMD ["pnpm", "run", "start"]
