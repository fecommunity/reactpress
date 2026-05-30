import { httpProvider } from './http';

export class UserProvider {
  /**
   * 用户登录
   * @param data
   */
  static async login(data): Promise<IUser> {
    return httpProvider.post('/auth/login', data);
  }

  static async checkAdmin(data): Promise<IUser> {
    return httpProvider.post('/auth/admin', data);
  }

  static async loginWithGithub(code): Promise<IUser> {
    return httpProvider.post('/auth/github', { code });
  }

  /**
   * 用户注册
   * @param data
   */
  static async register(data): Promise<IUser> {
    return httpProvider.post('/user/register', data);
  }

  /**
   * 获取用户
   * @param params
   */
  static getUsers(params): Promise<[IUser[], number]> {
    return httpProvider.get('/user', { params });
  }

  /**
   * 更新用户信息
   * @param data
   */
  static async update(data): Promise<IUser> {
    return httpProvider.post('/user/update', data);
  }

  /**
   * 更新用户密码
   * @param data
   */
  static async updatePassword(data): Promise<IUser> {
    return httpProvider.post('/user/password', data);
  }
}
