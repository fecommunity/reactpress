---
sidebar_position: 5
id: docker-deployment
title: Docker deployment guide
---

# Docker deployment guide

ReactPress supports containerized deployment with Docker so you can run the same stack consistently across environments.

## Docker architecture

Production Docker setup uses multiple services:

- **db**: MySQL 5.7
- **server**: NestJS API
- **client**: Next.js frontend
- **nginx**: reverse proxy

## Directory layout

```
reactpress/
├── docker-compose.prod.yml
├── client/Dockerfile
├── server/Dockerfile
└── nginx.conf
```

## Quick start

### 1. Prerequisites

```bash
docker --version
docker-compose --version
```

### 2. Clone the project

```bash
git clone https://github.com/fecommunity/reactpress.git
cd reactpress
```

### 3. Environment variables

Create `.env` in the project root:

```env
DB_HOST=db
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

CLIENT_SITE_URL=http://localhost:8080
SERVER_SITE_URL=http://localhost:8080
SERVER_API_URL=http://nginx/api
```

### 4. Start services

```bash
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

Open `http://localhost:8080`.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | db | Database host |
| DB_PORT | 3306 | Database port |
| DB_USER | reactpress | Database user |
| DB_PASSWD | reactpress | Database password |
| DB_DATABASE | reactpress | Database name |
| CLIENT_SITE_URL | http://localhost:8080 | Public site URL |
| SERVER_SITE_URL | http://localhost:8080 | Server URL |
| SERVER_API_URL | http://nginx/api | API base URL |

### Port mapping

| Service | Container | Host | Notes |
|---------|-----------|------|-------|
| nginx | 80 | 8080 | Entry point |
| server | 3002 | 3002 | API |
| client | 3001 | 3001 | Frontend |

## Development with Docker

Use `docker-compose.dev.yml` for hot reload and file sync. See the Chinese tutorial in the repo for a full dev compose example, or run:

```bash
reactpress docker start
```

## Common operations

```bash
# Production lifecycle
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml restart
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f

# Database shell
docker exec -it reactpress_db mysql -u reactpress -p reactpress
```

## Troubleshooting

1. **Port conflict** — change host ports in compose or stop the blocking process.
2. **Database connection refused** — ensure the `db` service is healthy and `.env` matches compose.
3. **Permission errors** — check volume mounts and container user permissions.

## Security

- Change default database passwords in production.
- Avoid exposing unnecessary ports.
- Keep base images and dependencies updated.

For advanced tuning (resource limits, CI/CD), see the full Chinese guide in `docs/tutorial/tutorial-extras/docker-deployment.md` or open a discussion on GitHub.
