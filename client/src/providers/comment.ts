import { httpProvider } from './http';

export class CommentProvider {
  /**
   * 获取所有评论
   */
  static async getComments(params): Promise<[IComment[], number]> {
    return httpProvider.get('/comment', { params });
  }

  /**
   * 获取指定评论
   * @param id
   */
  static async getComment(id): Promise<IComment> {
    return httpProvider.get(`/comment/${id}`);
  }

  /**
   * 获取指定文章评论
   * @param hostId
   */
  static async getArticleComments(hostId, params): Promise<[IComment[], number]> {
    return httpProvider.get(`/comment/host/${hostId}`, { params });
  }

  /**
   * 添加评论
   * @param data
   */
  static async addComment(data): Promise<IComment> {
    return httpProvider.post('/comment', data);
  }

  /**
   * 更新评论
   * @param id
   * @param data
   */
  static async updateComment(id, data): Promise<IComment> {
    return httpProvider.patch(`/comment/${id}`, data);
  }

  /**
   * 删除评论
   * @param id
   */
  static async deleteComment(id): Promise<IComment> {
    return httpProvider.delete(`/comment/${id}`);
  }
}
