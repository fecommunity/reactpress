import { httpProvider } from './http';

export class TagProvider {
  /**
   * 获取所有标签
   */
  static async getTags(params?: any): Promise<ITag[]> {
    return httpProvider.get('/tag', { params });
  }

  /**
   * 获取指定标签下文章
   * @param id
   */
  static async getTagWithArticles(id, needFilter = false): Promise<ITag> {
    return httpProvider.get(
      `/tag/${id}/article`,
      needFilter
        ? {
            params: { status: 'publish' },
          }
        : {}
    );
  }

  /**
   * 添加标签
   * @param data
   */
  static async addTag(data): Promise<ITag> {
    return httpProvider.post('/tag', data);
  }

  /**
   * 获取标签
   * @param id
   */
  static async getTagById(id): Promise<ITag> {
    return httpProvider.get(`/tag/${id}`);
  }

  /**
   * 更新标签
   * @param id
   * @param data
   */
  static async updateTag(id, data): Promise<ITag> {
    return httpProvider.patch(`/tag/${id}`, data);
  }

  /**
   * 删除标签
   * @param id
   */
  static async deleteTag(id): Promise<ITag> {
    return httpProvider.delete(`/tag/${id}`);
  }
}
