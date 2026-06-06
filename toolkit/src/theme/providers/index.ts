import type { AxiosInstance } from 'axios';

import type {
  IArticle,
  ICategory,
  IComment,
  IFile,
  IKnowledge,
  IPage,
  ISetting,
  ITag,
  IUser,
  IView,
} from '../../types';

/** Create REST provider classes bound to a theme HTTP client (axios + envelope unwrap). */
export function createThemeProviders(http: AxiosInstance) {
  class SettingProvider {
    static async getSetting(): Promise<ISetting> {
      return http.post('/setting/get');
    }

    static async updateSetting(data: Partial<ISetting>): Promise<ISetting> {
      return http.post('/setting', data);
    }
  }

  class ArticleProvider {
    static async getArticles(params: Record<string, unknown>): Promise<[IArticle[], number]> {
      return http.get('/article', { params });
    }

    static async getAllRecommendArticles(): Promise<IArticle[]> {
      return http.get('/article/all/recommend');
    }

    static async getArticlesByCategory(
      category: string,
      params: Record<string, unknown>,
    ): Promise<[IArticle[], number]> {
      return http.get(`/article/category/${category}`, { params });
    }

    static async getArticlesByTag(
      tag: string,
      params: Record<string, unknown>,
    ): Promise<[IArticle[], number]> {
      return http.get(`/article/tag/${tag}`, { params });
    }

    static async getRecommend(articleId: string | null = null, pageSize = 6): Promise<IArticle[]> {
      return http.get('/article/recommend', { params: { articleId, pageSize } });
    }

    static async getArchives(): Promise<Record<string, Record<string, IArticle[]>>> {
      return http.get('/article/archives');
    }

    static async getArticle(id: string): Promise<IArticle> {
      return http.get(`/article/${id}`);
    }

    static async addArticle(data: Partial<IArticle>): Promise<IArticle> {
      return http.post('/article', data);
    }

    static async updateArticle(id: string, data: Partial<IArticle>): Promise<IArticle> {
      return http.patch(`/article/${id}`, data);
    }

    static async updateArticleViews(id: string): Promise<IArticle> {
      return http.post(`/article/${id}/views`);
    }

    static async updateArticleLikes(id: string, type: string): Promise<IArticle> {
      return http.post(`/article/${id}/likes`, { type });
    }

    static async checkPassword(
      id: string,
      password: string,
    ): Promise<{ pass: boolean } & IArticle> {
      return http.post(`/article/${id}/checkPassword`, { password });
    }

    static async deleteArticle(id: string): Promise<IArticle> {
      return http.delete(`/article/${id}`);
    }
  }

  class CategoryProvider {
    static async getCategory(params?: Record<string, unknown>): Promise<ICategory[]> {
      return http.get('/category', { params });
    }

    static async add(data: Partial<ICategory>): Promise<ICategory> {
      return http.post('/category', data);
    }

    static async getCategoryById(id: string): Promise<ICategory> {
      return http.get(`/category/${id}`);
    }

    static async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
      return http.patch(`/category/${id}`, data);
    }

    static async delete(id: string): Promise<ICategory> {
      return http.delete(`/category/${id}`);
    }
  }

  class TagProvider {
    static async getTags(params?: Record<string, unknown>): Promise<ITag[]> {
      return http.get('/tag', { params });
    }

    static async getTagWithArticles(id: string, needFilter = false): Promise<ITag> {
      return http.get(
        `/tag/${id}/article`,
        needFilter ? { params: { status: 'publish' } } : {},
      );
    }

    static async addTag(data: Partial<ITag>): Promise<ITag> {
      return http.post('/tag', data);
    }

    static async getTagById(id: string): Promise<ITag> {
      return http.get(`/tag/${id}`);
    }

    static async updateTag(id: string, data: Partial<ITag>): Promise<ITag> {
      return http.patch(`/tag/${id}`, data);
    }

    static async deleteTag(id: string): Promise<ITag> {
      return http.delete(`/tag/${id}`);
    }
  }

  class PageProvider {
    static async getPages(params: Record<string, unknown>): Promise<[IPage[], number]> {
      return http.get('/page', { params });
    }

    static async getAllPublisedPages(): Promise<[IPage[], number]> {
      return http.get('/page', { params: { status: 'publish' } }).then((res) => {
        const [pages, total] = res as unknown as [IPage[], number];
        return [pages.sort((a, b) => -a.order + b.order), total];
      });
    }

    static async getPage(id: string): Promise<IPage> {
      return http.get(`/page/${id}`);
    }

    static async addPage(data: Partial<IPage>): Promise<IPage> {
      return http.post('/page', data);
    }

    static async updatePage(id: string, data: Partial<IPage>): Promise<IPage> {
      return http.patch(`/page/${id}`, data);
    }

    static async updatePageViews(id: string): Promise<IPage> {
      return http.post(`/page/${id}/views`);
    }

    static async deletePage(id: string): Promise<IPage> {
      return http.delete(`/page/${id}`);
    }
  }

  class CommentProvider {
    static async getComments(params: Record<string, unknown>): Promise<[IComment[], number]> {
      return http.get('/comment', { params });
    }

    static async getComment(id: string): Promise<IComment> {
      return http.get(`/comment/${id}`);
    }

    static async getArticleComments(
      hostId: string,
      params: Record<string, unknown>,
    ): Promise<[IComment[], number]> {
      return http.get(`/comment/host/${hostId}`, { params });
    }

    static async addComment(data: Partial<IComment>): Promise<IComment> {
      return http.post('/comment', data);
    }

    static async updateComment(id: string, data: Partial<IComment>): Promise<IComment> {
      return http.patch(`/comment/${id}`, data);
    }

    static async deleteComment(id: string): Promise<IComment> {
      return http.delete(`/comment/${id}`);
    }
  }

  class UserProvider {
    static async login(data: Record<string, unknown>): Promise<IUser> {
      return http.post('/auth/login', data);
    }

    static async loginWithGithub(code: string): Promise<IUser> {
      return http.post('/auth/github', { code });
    }

    static async register(data: Record<string, unknown>): Promise<IUser> {
      return http.post('/user/register', data);
    }

    static getUsers(params: Record<string, unknown>): Promise<[IUser[], number]> {
      return http.get('/user', { params });
    }

    static async update(data: Record<string, unknown>): Promise<IUser> {
      return http.post('/user/update', data);
    }

    static async updatePassword(data: Record<string, unknown>): Promise<IUser> {
      return http.post('/user/password', data);
    }
  }

  class KnowledgeProvider {
    static createBook(data: Partial<IKnowledge>): Promise<IKnowledge> {
      return http.post('/knowledge/book', data);
    }

    static createChapters(data: Partial<IKnowledge>[]): Promise<IKnowledge[]> {
      return http.post('/knowledge/chapter', data);
    }

    static async deleteKnowledge(id: string): Promise<IKnowledge> {
      return http.delete(`/knowledge/${id}`);
    }

    static async updateKnowledge(id: string, data: Partial<IKnowledge>): Promise<IKnowledge> {
      return http.patch(`/knowledge/${id}`, data);
    }

    static async getKnowledges(params: Record<string, unknown> = {}): Promise<[IKnowledge[], number]> {
      return http.get('/knowledge', { params });
    }

    static async getKnowledge(id: string): Promise<IKnowledge> {
      return http.get(`/knowledge/${id}`);
    }

    static async updateKnowledgeViews(id: string): Promise<IKnowledge> {
      return http.post(`/knowledge/${id}/views`);
    }

    static async updateKnowledgeLikes(id: string, type: string): Promise<IKnowledge> {
      return http.post(`/knowledge/${id}/likes`, { type });
    }
  }

  class SearchProvider {
    static async searchArticles(keyword: string): Promise<IArticle[]> {
      return http.get('/search/article', { params: { keyword } });
    }
  }

  class FileProvider {
    static async uploadFile(file: FormData, unique = 0): Promise<IFile> {
      return http.post('/file/upload', file, {
        headers: { 'Content-Type': 'multipart/form-data' },
        params: { unique },
      });
    }

    static async getFiles(params: Record<string, unknown>): Promise<[IFile[], number]> {
      return http.get('/file', { params });
    }

    static async deleteFile(id: string): Promise<IFile> {
      return http.delete(`/file/${id}`);
    }
  }

  class ViewProvider {
    static async getViews(params: Record<string, unknown>): Promise<[IView[], number]> {
      return http.get('/view', { params });
    }

    static async addView(data: Record<string, unknown>): Promise<IView> {
      return http.post('/view', data);
    }

    static async getViewsByUrl(url: string): Promise<IView[]> {
      return http.get('/view/url', { params: { url } });
    }

    static async deleteView(id: string): Promise<IView> {
      return http.delete(`/view/${id}`);
    }
  }

  class MailProvider {
    static async getMails(params: Record<string, unknown>): Promise<[Record<string, unknown>[], number]> {
      return http.get('/mail', { params });
    }

    static async deleteMail(id: string): Promise<Record<string, unknown>> {
      return http.delete(`/mail/${id}`);
    }
  }

  class SmtpProvider {
    static async testSendMail(user: Record<string, unknown>): Promise<IFile> {
      return http.post('/smtp/test', user);
    }
  }

  class PosterProvider {
    static async createPoster(data: Record<string, unknown>): Promise<{ name: string; url: string }> {
      return http.post('/poster', data);
    }
  }

  return {
    SettingProvider,
    ArticleProvider,
    CategoryProvider,
    TagProvider,
    PageProvider,
    CommentProvider,
    UserProvider,
    KnowledgeProvider,
    SearchProvider,
    FileProvider,
    ViewProvider,
    MailProvider,
    SmtpProvider,
    PosterProvider,
  };
}

export type ThemeProviders = ReturnType<typeof createThemeProviders>;
