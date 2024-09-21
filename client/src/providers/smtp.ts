import { httpProvider } from './http';

export class SMTPProvider {
  /**
   * 上传文件
   * @param file
   */
  static async testSendMail(user): Promise<IFile> {
    return httpProvider.post('/smtp', {
      to: user,
      subject: '测试',
      text: '测试邮件',
    });
  }
}
