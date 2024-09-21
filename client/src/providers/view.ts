import { httpProvider } from './http';

export class ViewProvider {
  /**
   * 获取所有访问
   */
  static async getViews(params): Promise<[IView[], number]> {
    return httpProvider.get('/view', { params });
  }

  /**
   * 添加访问
   * @param data
   */
  static async addView(data): Promise<IView> {
    return httpProvider.post('/view', data);
  }

  static async getViewsByUrl(url): Promise<IView[]> {
    return httpProvider.get('/view/url', { params: { url } });
  }

  static async deleteView(id): Promise<IView> {
    return httpProvider.delete('/view/' + id);
  }
}
