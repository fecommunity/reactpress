---
sidebar_position: 2
title: 后端接口定义
---

## swagger 文档

启动项目后，访问 `http://localhost:3002/api` 即可预览 swagger 文档。

## 模块

### 用户

- `POST /user/register`：用户注册（`name`、`password`）
- `POST /auth/login`：用户登录（`name`、`password`）
- `POST /user/update`：更新用户信息
- `POST /user/password`：更新用户密码（`oldPassword`、`newPassword`）

### 文章

- `POST /article`：创建文章
- `GET /article`：获取所有文章
- `GET /article/category/:categoryId`：获取指定分类下所有文章
- `GET /article/tag/:tagId`：获取指定标签下所有文章
- `GET /article/archives`：获取所有文章归档
- `GET /article/:articleId`：获取指定文章
- `GET /article/all/recommend`：获取所有推荐文章
- `GET /article/recommend/:articleId`：获取指定文章的推荐文章
- `POST /article/:articleId/checkPassword`：校验指定文章的密码
- `POST /article/:articleId/views`：指定文章访问量 +1
- `POST /article/:articleId/`：更新指定文章
- `DELETE /article/:articleId/`：删除指定文章

### 文章分类

- `POST /category`：创建文章分类
- `GET /category`：获取所有文章分类
- `GET /category/:id`：获取指定文章分类
- `POST /category/:id`：更新指定文章分类
- `DELETE /category/:id`：删除指定文章分类

### 文章标签

- `POST /tag`：创建文章标签
- `GET /tag`：获取所有文章标签
- `GET /tag/:id`：获取指定文章标签
- `POST /tag/:id`：更新指定文章标签
- `DELETE /tag/:id`：删除指定文章标签

### 文章评论

- `POST /commengt`：创建评论
- `GET /commengt`：获取所有评论
- `GET /commengt/host/:hostId`：获取指定文章（或页面）评论
- `POST /commengt/:id`：更新指定评论
- `DELETE /commengt/:id`：删除指定评论

### 页面

- `POST /page`：创建页面
- `GET /page`：获取所有页面
- `GET /page/:id`：获取指定页面
- `POST /page/:id`：更新指定页面
- `POST /page/:id/views`：指定页面访问量 +1
- `DELETE /page/:id`：删除指定页面

### 文件

- `POST /file/`：上传文件
- `GET /file/:id`：获取指定文件记录
- `DELETE /file/:id`：删除指定文件记录

### 搜索

- `POST /search/article`：搜索文章
- `GET /search`：获取所有搜索记录
- `DELETE /search/:id`：删除指定搜索记录

### 设置

- `POST /setting`：更新设置
- `POST /setting/get`：获取设置

### 邮件

- `POST /smtp`：发送邮件
- `GET /smtp`：获取邮件记录
- `DELETE /smtp/:id`：删除指定邮件记录
