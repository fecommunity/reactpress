import { httpProvider } from './http';

export class PageProvider {
  /**
   * 获取所有页面
   */
  static async getPages(params): Promise<[IPage[], number]> {
    return httpProvider.get('/page', { params: params });
  }

  /**
   * 获取所有已发布页面
   */
  static async getAllPublisedPages(): Promise<[IPage[], number]> {
    return httpProvider.get('/page', { params: { status: 'publish' } }).then((res) => {
      return [res[0].sort((a, b) => -a.order + b.order), res[1]];
    });
  }

  /**
   * 获取指定页面
   * @param id
   */
  static async getPage(id): Promise<IPage> {
    return httpProvider.get(`/page/${id}`);
  }

  /**
   * 新建页面
   * @param data
   */
  static async addPage(data): Promise<IPage> {
    return httpProvider.post('/page', data);
  }

  /**
   * 更新页面
   * @param id
   * @param data
   */
  static async updatePage(id, data): Promise<IPage> {
    return httpProvider.patch(`/page/${id}`, data);
  }

  /**
   * 更新文章阅读量
   * @param id
   * @param data
   */
  static async updatePageViews(id): Promise<IPage> {
    return httpProvider.post(`/page/${id}/views`);
  }

  /**
   * 删除页面
   * @param id
   */
  static async deletePage(id): Promise<IPage> {
    return httpProvider.delete(`/page/${id}`);
  }
}
