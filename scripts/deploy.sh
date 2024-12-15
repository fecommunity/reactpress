# 更新代码
git checkout master
git pull

# 安装依赖&构建
pnpm install

# 构建本地配置
pnpm run build:config

# 构建服务器
pnpm run build:server

# 结束进程
pm2 delete @reactpress/server
pm2 delete @reactpress/client

# 构建本地client
pnpm run build:client

# 启动
pnpm run pm2

# 开机启动
pm2 startup
pm2 save
