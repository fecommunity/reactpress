import { httpProvider } from './http';

export class PosterProvider {
  static async createPoster(data): Promise<{ name: string; url: string }> {
    return httpProvider.post('/poster', data);
  }
}
