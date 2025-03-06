---
sidebar_position: 3
title: 服务端开发
---

# NestJS 服务端开发流程简介

NestJS 是一个用于构建高效、可靠和可扩展的服务器端应用程序的框架。它使用 TypeScript（但也支持纯 JavaScript）并完全基于 Node.js。NestJS 提供了强大的架构支持，允许开发者使用现代 JavaScript 的特性来编写清晰、可维护的代码。本文将介绍 NestJS 服务端开发的基本流程，并通过简单的代码示例来帮助理解。

## 一、安装 NestJS CLI

首先，你需要安装 NestJS 的命令行工具（CLI），这将简化项目的创建和管理过程。

```bash
npm i -g @nestjs/cli
```

安装完成后，你可以使用 `nest` 命令来创建一个新的 NestJS 项目。

```bash
nest new my-nest-project
```

这将创建一个名为 `my-nest-project` 的新文件夹，并在其中初始化一个 NestJS 项目。

## 二、项目结构

NestJS 项目通常具有以下结构：

```
my-nest-project/
├── node_modules/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── ... (其他文件和文件夹)
├── package.json
├── tsconfig.json
└── ... (其他配置文件)
```

`src` 文件夹包含应用程序的源代码。其中，`app.module.ts` 是应用程序的根模块，`app.controller.ts` 和 `app.service.ts` 分别包含控制器和服务的基本示例。

## 三、创建模块和控制器

在 NestJS 中，模块是组织代码的基本单位。每个模块都有一个与之关联的模块类，该类使用 `@Module` 装饰器进行装饰。

### 1. 创建模块

你可以使用 NestJS CLI 来创建一个新模块。例如，创建一个名为 `cats` 的模块：

```bash
nest generate module cats
```

这将在 `src` 文件夹中创建一个 `cats` 文件夹，并在其中生成一个 `cats.module.ts` 文件。

### 2. 创建控制器

控制器负责处理传入的请求并返回响应。你可以使用以下命令来创建一个新的控制器：

```bash
nest generate controller cats
```

这将在 `cats` 文件夹中生成一个 `cats.controller.ts` 文件。

下面是一个简单的控制器示例，它定义了一个 GET 端点来返回所有猫的信息：

```typescript
// src/cats/cats.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

### 3. 将控制器添加到模块中

为了使控制器能够响应请求，你需要将它添加到模块的 `controllers` 数组中：

```typescript
// src/cats/cats.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';

@Module({
  controllers: [CatsController],
})
export class CatsModule {}
```

## 四、创建服务

服务通常用于封装业务逻辑。你可以使用以下命令来创建一个新的服务：

```bash
nest generate service cats
```

这将在 `cats` 文件夹中生成一个 `cats.service.ts` 文件。

下面是一个简单的服务示例，它提供了一个方法来获取所有猫的信息：

```typescript
// src/cats/cats.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  findAll(): string[] {
    return ['cat1', 'cat2', 'cat3'];
  }
}
```

然后，你可以将服务注入到控制器中，并使用它来处理请求：

```typescript
// src/cats/cats.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { CatsService } from './cats.service';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll(): string[] {
    return this.catsService.findAll();
  }
}
```

不要忘记在模块中将服务添加到 `providers` 数组中：

```typescript
// src/cats/cats.module.ts
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

## 五、将模块添加到根模块中

最后，你需要将新创建的 `CatsModule` 添加到应用程序的根模块中，以便 NestJS 能够识别和加载它。

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}
```

## 六、启动应用程序

现在，你可以启动 NestJS 应用程序了。在项目根目录中运行以下命令：

```bash
npm run start
```

应用程序启动后，你可以打开浏览器并访问 `http://localhost:3000/cats`，你应该会看到返回的所有猫的信息。

## 七、总结

本文介绍了 NestJS 服务端开发的基本流程，包括安装 NestJS CLI、创建项目、创建模块和控制器、创建服务以及将模块添加到根模块中。通过简单的代码示例，希望能够帮助你快速上手 NestJS 并构建自己的服务器端应用程序。


更多关于NestJS的服务端开发流程可以参考：https://docs.nestjs.com/

