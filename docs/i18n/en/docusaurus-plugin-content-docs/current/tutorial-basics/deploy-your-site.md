---
sidebar_position: 5
title: Deploy Your Site
---

### Environmental preparation
```bash
$ git clone --depth=1 https://github.com/fecommnity/reactpress.git
$ cd reactpress
$ npm i -g pnpm
$ pnpm i
```

### Configuration file

After the project starts, the `.env` configuration file in the root directory will be loaded. Please ensure that the MySQL database service is consistent with the following configuration, and create the `reactpress` database in advance

```js
DB_HOST=127.0.0.1 // Database address
DB_PORT=3306 // Port
DB_USER=reactpress // Username
DB_PASSWD=reactpress // Password
DB_DATABASE=reactpress // Database
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

### Independent Package Deployment

ReactPress 2.0 supports deploying individual packages:

```bash
# Deploy server only
npx @fecommunity/reactpress-server --pm2

# Deploy client only
npx @fecommunity/reactpress-client --pm2
```

For detailed deployment information for each package, please refer to the [Advanced Tutorials](../tutorial-extras/client-package).
### Code update startup

After the ReactPress code is updated, the service can be restarted using the following shell:

```bash
# Update code
git checkout master
git pull

# Install dependencies&build
pnpm install
pnpm run build

# Start process
pm2 delete reactpress-server
pm2 delete reactpress-client
pnpm run pm2

# Power on and start up
pm2 startup
pm2 save
```

The above is the complete deployment process for the ReactPress generation environment.