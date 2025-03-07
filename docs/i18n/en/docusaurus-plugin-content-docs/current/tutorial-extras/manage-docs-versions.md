---
sidebar_position: 2
title: Open API
---

## Swagger documentation
After starting the project, access` http://localhost:3002/api `You can preview the swagger document.

## Module
### User
- POST/user/register: User registration (name, password)
- POST/auth/login: User login (name, password)
- POST/user/update: Update user information
- POST/user/password: Update user passwords (oldPassword, newPassword)

### Article
- POST/article: Create an article
- GET/article: Get all articles
- `GET /article/category/: categoryId`： Retrieve all articles under the specified category
- `GET /article/tag/: tagId`： Retrieve all articles under the specified tag
- GET/article/archives: Get all article archives
- `GET /article/: articleId`： Get specified article
- GET/article/all/recommendation: Get all recommended articles
- `GET /article/recommend/: articleId`： Get recommended articles for the specified article
- `POST /article/: articleId/checkPassword`： Verify the password of the specified article
- `POST /article/: articleId/views`： Specify article traffic+1
- `POST /article/: articleId/`： Update specified article
- `DELETE /article/: articleId/`： Delete specified article
### Article classification
- POST/category: Create article category
- GET/category: Get all article categories
- `GET /category/: id`： Retrieve the specified article category
- `POST /category/: id`： Update the specified article category
- `DELETE /category/: id`： Delete specified article category
### Article tags
- POST/tag: Create article tags
- GET/tag: Get all article tags
- `GET /tag/: id`： Get the specified article tag
- `POST /tag/: id`： Update specified article tags
- `DELETE /tag/: id`： Delete the specified article tag
### Article comments
- POST/commenting: Create a comment
- GET/commenting: Get all comments
- `GET /commengt/host/: hostId`： Get comments on the specified article (or page)
- `POST /commengt/: id`： Update specified comments
- `DELETE /commengt/: id`： Delete specified comment
### Page
- POST/page: Create page
- GET/page: Get all pages
- `GET /page/: id`： Retrieve the specified page
- `POST /page/: id`： Update specified page
- `POST /page/: id/views`： Specify page views+1
- `DELETE /page/: id`： Delete specified page
### File
- POST/file/: Upload file
- `GET /file/: id`： Retrieve specified file records
- `DELETE /file/: id`： Delete specified file records
### Search
- POST/search/article: Search for articles
- GET/search: Retrieve all search records
- `DELETE /search/: id`： Delete specified search records
### Setting up
- POST/setting: Update settings
- POST/setting/get: Get settings
### Email
- POST/smtp: Send email
- GET/smtp: Retrieve email records
- `DELETE /smtp/: id`： Delete specified email records