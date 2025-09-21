// src/services/articleService.ts
import api, { types, utils } from '../dist';

// 文章服务层
export class ArticleService {
  // 获取所有文章
  static async getAllArticles() {
    try {
      const articles = await api.article.getRecommendArticles({});
      
      // 格式化数据
      return articles.data.map(article => ({
        ...article,
        formattedDate: utils.formatDate(new Date(article.createdAt || Date.now())),
      }));
    } catch (error) {
      throw this.handleError(error, '获取文章列表失败');
    }
  }

  // 获取单篇文章
  static async getArticleById(id: string) {
    try {
      return await api.article.findById(id);
    } catch (error) {
      throw this.handleError(error, '获取文章失败');
    }
  }

  // 创建文章
  static async createArticle(articleData: Partial<types.IArticle>) {
    try {
      return await api.article.create({});
    } catch (error) {
      throw this.handleError(error, '创建文章失败');
    }
  }

  // 更新文章
  static async updateArticle(id: string, updates: Partial<types.IArticle>) {
    try {
      return await api.article.updateById(id);
    } catch (error) {
      throw this.handleError(error, '更新文章失败');
    }
  }

  // 删除文章
  static async deleteArticle(id: string) {
    try {
      return await api.article.deleteById(id);
    } catch (error) {
      throw this.handleError(error, '删除文章失败');
    }
  }

  // 统一错误处理
  private static handleError(error: unknown, defaultMessage: string) {
    if (utils.ApiError.isInstance(error)) {
      return error;
    }
    
    return new utils.ApiError(500, defaultMessage, error);
  }
}