import { httpProvider } from './http';

export class KnowledgeProvider {
  /**
   * 创建知识库
   * @param data
   */
  static createBook(data): Promise<IKnowledge> {
    return httpProvider.post('/knowledge/book', data);
  }

  /**
   * 创建知识库章节
   * @param data
   */
  static createChapters(data): Promise<Array<IKnowledge>> {
    return httpProvider.post('/knowledge/chapter', data);
  }

  /**
   * 删除文章
   * @param id
   */
  static async deleteKnowledge(id): Promise<IKnowledge> {
    return httpProvider.delete(`/knowledge/${id}`);
  }

  /**
   * 更新文章
   * @param id
   * @param data
   */
  static async updateKnowledge(id, data): Promise<IKnowledge> {
    return httpProvider.patch(`/knowledge/${id}`, data);
  }

  /**
   * 获取所有知识库（不包含章节）
   */
  static async getKnowledges(params = {}): Promise<[IKnowledge[], number]> {
    return httpProvider.get('/knowledge', { params });
  }

  /**
   * 获取知识详情（如果是知识库，包含所有章节）
   * @param id
   */
  static async getKnowledge(id): Promise<IKnowledge> {
    return httpProvider.get(`/knowledge/${id}`);
  }

  /**
   * 更新知识阅读量
   * @param id
   * @param data
   */
  static async updateKnowledgeViews(id): Promise<IKnowledge> {
    return httpProvider.post(`/knowledge/${id}/views`);
  }

  /**
   * 更新知识喜欢数
   * @param id
   * @param data
   */
  static async updateKnowledgeLikes(id, type): Promise<IKnowledge> {
    return httpProvider.post(`/knowledge/${id}/likes`, { type });
  }
}
