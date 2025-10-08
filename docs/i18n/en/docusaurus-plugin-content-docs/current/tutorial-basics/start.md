---
sidebar_position: 1
title: Development
---


##  ⌨️  Local Development
### Environmental preparation
```bash
$ git clone --depth=1  https://github.com/fecommunity/reactpress.git
$ cd reactpress
$ npm i -g pnpm
$ pnpm i
```

### File Structure

The code structure of the project is as follows:
```shell
├─ client // Next.js based frontend client
├─ server // NestJS based backend API service
├─ toolkit // TypeScript API client toolkit
├─ templates // Template files
├─ scripts // Build scripts
├─ docs // Documentation
└─ package.json
```

ReactPress 2.0 adopts a monorepo structure, separating the frontend, backend, and toolkit into independent packages that can be developed and deployed separately.

### Configuration file

After the project starts, the `. env ` configuration file in the root directory will be loaded. Please ensure that the MySQL database service is consistent with the following configuration, and create the ` reactpress ` database in advance

```js
DB_SOST=127.0.0.1//Database address
DB-PORT=3306//Port
DBVNet=reactpress//username
DB-PASSWD=reactpress//Password
DBDATABASE=React Press//Database
```
### Start up

After the environment is ready, execute the startup command:
```bash
$ pnpm run dev
```

Open the browser to access http://127.0.0.1:3001