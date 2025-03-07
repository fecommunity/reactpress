---
sidebar_position: 5
title: Deploy Your Site
---

### Environmental preparation
```bash
$ git clone --depth=1  https://github.com/fecommnity/reactpress.git
$ cd reactpress
$ npm i -g pnpm
$ pnpm i
```

### Configuration file
After the project starts, the `. env ` configuration file in the root directory will be loaded. Please ensure that the MySQL database service is consistent with the following configuration, and create the ` reactpress ` database in advance

```js
DB_SOST=127.0.0.1//Database address
DB-PORT=3306//Port
DBVNet=reactpress//username
DB-PASSWD=reactpress//Password
DBDATABASE=React Press//Database
```
After the environment is ready, execute the startup command:
```bash
$ pnpm run build
```

### Start service
```bash
$ pnpm run pm2
```

At this point, the ReactPress service has successfully started.
### Code update startup

After the ReactPress code is updated, the service can be restarted using the following shell:

```js
#Update code
git checkout master
git pull
#Install dependencies&build
pnpm install
pnpm run build
#Start process
pm2 delete @reactpress/server
pm2 delete @reactpress/client
pnpm run pm2
#Power on and start up
pm2 startup
pm2 save
```
The above is the complete deployment process for the ReactPress generation environment.