---
sidebar_position: 5
id: docker-deployment
title: Docker 部署指南
description: ReactPress Docker 部署 — 容器化架构、docker-compose 配置、生产环境镜像构建与运维。
keywords: [reactpress, docker, deployment, container, compose]
---

# Docker 部署指南

ReactPress 支持通过 Docker 进行容器化部署，这使得在不同环境中部署和运行 ReactPress 变得更加简单和一致。

## 🐳 Docker 架构

ReactPress 的 Docker 部署采用多容器架构，包含以下服务：

- **db**: MySQL 5.7 数据库服务
- **server**: 基于 NestJS 的后端 API 服务（生产 compose 中默认运行在宿主机）
- **theme**: 基于 Next.js 的访客主题
- **nginx**: Nginx 反向代理服务器

## 📁 目录结构

```
reactpress/
├── docker-compose.prod.yml  # 生产环境 Docker 编排文件
├── themes/hello-world/
│   └── （访客主题由 runtime 安装，见主题文档）
├── server/
│   └── Dockerfile           # 服务端 Docker 配置
└── nginx.conf               # Nginx 配置文件
```

## 🚀 快速开始

### 1. 环境准备

确保已安装 Docker 和 Docker Compose：

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker-compose --version
```

### 2. 克隆项目

```bash
git clone https://github.com/fecommunity/reactpress.git
cd reactpress
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=db
DB_PORT=3306
DB_USER=reactpress
DB_PASSWD=reactpress
DB_DATABASE=reactpress

# 客户端配置
CLIENT_SITE_URL=http://localhost:8080

# 服务端配置
SERVER_SITE_URL=http://localhost:8080
SERVER_API_URL=http://nginx/api
```

### 4. 启动服务

```bash
# 使用 Docker Compose 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

访问 `http://localhost:8080` 查看应用。

## ⚙️ 配置说明

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| DB_HOST | db | 数据库主机地址 |
| DB_PORT | 3306 | 数据库端口 |
| DB_USER | reactpress | 数据库用户名 |
| DB_PASSWD | reactpress | 数据库密码 |
| DB_DATABASE | reactpress | 数据库名称 |
| CLIENT_SITE_URL | http://localhost:8080 | 客户端站点URL |
| SERVER_SITE_URL | http://localhost:8080 | 服务端站点URL |
| SERVER_API_URL | http://nginx/api | API服务URL |

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|----------|----------|------|
| nginx | 80 | 8080 | 反向代理入口 |
| server | 3002 | 3002 | 后端 API（宿主机，经 nginx 转发） |
| theme | 3001 | 3001 | 访客主题服务 |

## 🛠️ 开发环境

为了方便开发，ReactPress 还提供了开发环境的 Docker 配置，支持热重载和文件同步。

### 开发环境配置

创建 `docker-compose.dev.yml` 文件：

```yaml
version: '3.8'

services:
  db:
    image: mysql:5.7
    container_name: reactpress_db_dev
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: reactpress
      MYSQL_USER: reactpress
      MYSQL_PASSWORD: reactpress
    command: 
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --default-authentication-plugin=mysql_native_password
    volumes:
      - db_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - reactpress-network

  server:
    build: 
      context: .
      dockerfile: server/Dockerfile.dev
    container_name: reactpress_server_dev
    restart: always
    depends_on:
      - db
    environment:
      - NODE_ENV=development
      - DB_HOST=db
      - DB_PORT=3306
      - DB_USER=reactpress
      - DB_PASSWD=reactpress
      - DB_DATABASE=reactpress
      - SERVER_SITE_URL=http://localhost:3002
    ports:
      - "3002:3002"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/server/node_modules
    networks:
      - reactpress-network

  client:
    build:
      context: .
      dockerfile: client/Dockerfile.dev
    container_name: reactpress_client_dev
    restart: always
    depends_on:
      - server
    environment:
      - NODE_ENV=development
      - CLIENT_SITE_URL=http://localhost:3001
      - SERVER_API_URL=http://server:3002
    ports:
      - "3001:3001"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/client/node_modules
    networks:
      - reactpress-network

volumes:
  db_data:

networks:
  reactpress-network:
    driver: bridge
```

### 启动开发环境

```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 停止开发环境
docker-compose -f docker-compose.dev.yml down
```

## 📦 镜像构建

### 构建生产镜像

```bash
# 构建所有服务镜像
docker-compose -f docker-compose.prod.yml build

# 单独构建某个服务
docker-compose -f docker-compose.prod.yml build client
docker-compose -f docker-compose.prod.yml build server
```

### 构建开发镜像

```bash
# 构建开发镜像
docker-compose -f docker-compose.dev.yml build
```

## 🔧 常用操作

### 管理服务

```bash
# 启动所有服务
docker-compose -f docker-compose.prod.yml up -d

# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 重启服务
docker-compose -f docker-compose.prod.yml restart

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看服务日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 数据库操作

```bash
# 进入数据库容器
docker exec -it reactpress_db mysql -u reactpress -p reactpress

# 备份数据库
docker exec reactpress_db mysqldump -u reactpress -p reactpress reactpress > backup.sql

# 恢复数据库
docker exec -i reactpress_db mysql -u reactpress -p reactpress reactpress < backup.sql
```

### 应用管理

```bash
# 进入服务端容器
docker exec -it reactpress_server sh

# 进入客户端容器
docker exec -it reactpress_client sh
```

## 🚨 故障排除

### 常见问题

1. **端口冲突**
   ```
   ERROR: for reactpress_db  Cannot start service db: driver failed programming external connectivity on endpoint reactpress_db: Error starting userland proxy: listen tcp 0.0.0.0:3306: bind: address already in use
   ```
   解决方案：修改 docker-compose 文件中的端口映射，或停止占用端口的进程。

2. **数据库连接失败**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3306
   ```
   解决方案：检查数据库服务是否正常启动，确认环境变量配置正确。

3. **权限问题**
   ```
   Error: EACCES: permission denied
   ```
   解决方案：检查容器内文件权限，确保应用有足够权限访问所需文件。

### 日志查看

```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs server

# 实时查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

## 📈 性能优化

### 资源限制

在 docker-compose 文件中可以为容器设置资源限制：

```yaml
server:
  # ... 其他配置
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
      reservations:
        cpus: '0.25'
        memory: 256M
```

### 数据库优化

```yaml
db:
  # ... 其他配置
  command: 
    - --character-set-server=utf8mb4
    - --collation-server=utf8mb4_unicode_ci
    - --innodb-buffer-pool-size=256M
    - --innodb-log-file-size=64M
    - --max-connections=200
```

## 🔒 安全建议

1. **修改默认密码**：在生产环境中，务必修改默认的数据库密码
2. **网络隔离**：使用 Docker 网络隔离，避免不必要的端口暴露
3. **定期更新**：定期更新基础镜像和依赖包
4. **最小权限原则**：使用非 root 用户运行应用

## 🔄 持续集成/部署

可以将 Docker 部署集成到 CI/CD 流程中：

```bash
# 构建并推送镜像
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push

# 部署到远程服务器
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

通过 Docker 部署，ReactPress 可以在任何支持 Docker 的平台上快速部署和运行，大大简化了部署流程并提高了环境一致性。