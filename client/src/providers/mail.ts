import { httpProvider } from './http';

export class MailProvider {
  /**
   * 获取所有邮件
   */
  static async getMails(params): Promise<[IMail[], number]> {
    return httpProvider.get('/smtp', { params });
  }

  static async deleteMail(id): Promise<IMail> {
    return httpProvider.delete('/smtp/' + id);
  }
}
