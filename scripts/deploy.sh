# 更新代码
git checkout master
git pull

# 安装依赖&构建
pnpm install
pnpm run build

# 启动进程
pm2 delete @reactpress/server
pm2 delete @reactpress/client
pnpm run pm2

# 开机启动
pm2 startup
pm2 save
