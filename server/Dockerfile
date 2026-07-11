FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY toolkit/package.json ./toolkit/
COPY server/package.json ./server/
COPY cli/package.json ./cli/
COPY web/package.json ./web/
COPY themes/hello-world/package.json ./themes/hello-world/

RUN pnpm install --frozen-lockfile

COPY toolkit ./toolkit
COPY server ./server

RUN pnpm run --dir toolkit build
WORKDIR /app/server
RUN pnpm run build

EXPOSE 3002

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

CMD ["pnpm", "run", "start"]
