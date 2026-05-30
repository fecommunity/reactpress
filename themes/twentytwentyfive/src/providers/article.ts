import { httpProvider } from './http';

export class ArticleProvider {
  /**
   * 获取所有文章
   */
  static async getArticles(params): Promise<[IArticle[], number]> {
    return httpProvider.get('/article', { params });
  }

  /**
   * 获取所有推荐文章
   */
  static async getAllRecommendArticles(): Promise<IArticle[]> {
    return httpProvider.get('/article/all/recommend');
  }

  /**
   * 获取分类所有文章
   * @param category
   * @param params
   */
  static async getArticlesByCategory(category, params): Promise<[IArticle[], number]> {
    return httpProvider.get('/article/category/' + category, { params });
  }

  /**
   * 获取标签所有文章
   * @param tag
   * @param params
   */
  static async getArticlesByTag(tag, params): Promise<[IArticle[], number]> {
    return httpProvider.get('/article/tag/' + tag, { params });
  }

  /**
   * 获取推荐文章
   * @param articleId
   */
  static async getRecommend(articleId = null): Promise<IArticle[]> {
    return httpProvider.get('/article/recommend', { params: { articleId } });
  }

  /**
   * 获取所有文章归档
   */
  static async getArchives(): Promise<{
    [key: string]: { [key: string]: IArticle[] };
  }> {
    return httpProvider.get('/article/archives');
  }

  /**
   * 获取指定文章
   * @param id
   */
  static async getArticle(id): Promise<IArticle> {
    return httpProvider.get(`/article/${id}`);
  }

  /**
   * 新建文章
   * @param data
   */
  static async addArticle(data): Promise<IArticle> {
    return httpProvider.post('/article', data);
  }

  /**
   * 更新文章
   * @param id
   * @param data
   */
  static async updateArticle(id, data): Promise<IArticle> {
    return httpProvider.patch(`/article/${id}`, data);
  }

  /**
   * 更新文章阅读量
   * @param id
   * @param data
   */
  static async updateArticleViews(id): Promise<IArticle> {
    return httpProvider.post(`/article/${id}/views`);
  }

  /**
   * 更新文章喜欢数
   * @param id
   * @param data
   */
  static async updateArticleLikes(id, type): Promise<IArticle> {
    return httpProvider.post(`/article/${id}/likes`, { type });
  }

  /**
   * 校验文章密码是否正确
   * @param id
   * @param password
   */
  static async checkPassword(id, password): Promise<{ pass: boolean } & IArticle> {
    return httpProvider.post(`/article/${id}/checkPassword`, { password });
  }

  /**
   * 删除文章
   * @param id
   */
  static async deleteArticle(id): Promise<IArticle> {
    return httpProvider.delete(`/article/${id}`);
  }
}
