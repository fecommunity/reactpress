#! /bin/bash

cd easy-blog
git checkout master
git pull

pnpm install
pnpm run build
pnpm run pm2

pm2 startup
pm2 save
