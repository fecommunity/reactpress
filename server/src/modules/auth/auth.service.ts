import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

import { uniqueid } from '../../utils/uniqueid.util';
import { SettingService } from '../setting/setting.service';
import { SMTPService } from '../smtp/smtp.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly settingService: SettingService,
    private readonly smtpService: SMTPService
  ) {}

  createToken(user: Partial<User>) {
    const accessToken = this.jwtService.sign(user);
    return accessToken;
  }

  async login(user: Partial<User>) {
    const data = await this.userService.login(user);
    const token = this.createToken({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    return Object.assign(data, { token });
  }

  async loginWithoutPasswd(user: Partial<User>) {
    const data = await this.userService.loginWithoutPasswd(user);
    const token = this.createToken({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    return Object.assign(data, { token });
  }

  async checkAdmin() {
    return true;
  }

  async validateUser(payload: User) {
    const user = await this.userService.findById(payload.id);
    return user;
  }

  async loginWithGithub(code) {
    if (!code) {
      throw new HttpException('请输入Gitub授权码', HttpStatus.BAD_REQUEST);
    }

    try {
      const tokenResponse = (await axios({
        method: 'post',
        url:
          'https://github.com/login/oauth/access_token?' +
          `client_id=${this.configService.get('GITHUB_CLIENT_ID')}&` +
          `client_secret=${this.configService.get('GITHUB_CLIENT_SECRET')}&` +
          `code=${code}`,
        headers: {
          accept: 'application/json',
        },
      })) as any;
      const accessToken = tokenResponse.data.access_token;
      const result = (await axios({
        method: 'get',
        url: `https://api.github.com/user`,
        headers: {
          accept: 'application/json',
          Authorization: `token ${accessToken}`,
        },
      })) as any;

      if (result.data.email) {
        const user = {
          name: result.data.name,
          avatar: result.data.avatar_url,
          email: result.data.email,
          type: 'github',
        };

        const existUser = await this.userService.findByConditions(user);

        if (!existUser) {
          const password = `easy-blog_${uniqueid()}_${result.data.email}`;
          await this.userService.createUser({ ...user, password });
          const setting = await this.settingService.findAll(true);
          const emailMessage = {
            from: setting.smtpFromUser,
            to: result.data.email,
            subject: 'Github 用户登录通知',
            html: `您好，您使用了 Github 登录了 reactpress。reactpress 已为您创建用户，用户名称：${result.data.name}， 用户密码：${password}，请及时登录系统修改密码`,
          };
          this.smtpService.create(emailMessage).catch(() => {
            console.log(`通知用户 ${result.data.name}（${result.data.email}），但发送邮件通知失败`);
          });
        }

        const res = await this.loginWithoutPasswd(user);
        return res;
      } else {
        throw new HttpException('未获取到您的公开邮件地址，无法使用Github登录', HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      throw new HttpException(e.message || e, HttpStatus.BAD_REQUEST);
    }
  }
}
