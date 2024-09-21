import { httpProvider } from './http';

export class SearchProvider {
  static async searchArticles(keyword): Promise<IArticle[]> {
    return httpProvider.get('/search/article', {
      params: { keyword },
    });
  }

  static getRecords(params): Promise<[ISearch[], number]> {
    return httpProvider.get('/search', { params });
  }

  static deleteRecord(id): Promise<ISearch> {
    return httpProvider.delete('/search/' + id);
  }
}
