import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { isValidUsername } from '../../utils/user.util';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService
  ) {
    const name = this.configService.get('ADMIN_USER', 'admin');
    const password = this.configService.get('ADMIN_PASSWD', 'admin');

    this.createUser({ name, password, role: 'admin' }, true)
    .then(() => {
      console.log(`[reactpress] 管理员账户创建成功，用户名：${name}，密码：${password}，请及时登录系统修改默认密码`);
    })
    .catch(async (e) => {
      const existAdminUser = await this.userRepository.findOne({ where: { name } });
        const isDefaultPasswd = User.comparePassword(password, existAdminUser.password);
        if (isDefaultPasswd) {
          console.log(`[reactpress] 管理员账户已经存在，用户名：${name}，密码：${password}，请及时登录系统修改默认密码`);
        }
      });
  }

  async findByConditions(conditions: Partial<User>) {
    return await this.userRepository.findOne(conditions);
  }

  async findAll(queryParams): Promise<[User[], number]> {
    const query = this.userRepository.createQueryBuilder('user').orderBy('user.createAt', 'DESC');

    if (typeof queryParams === 'object') {
      const { page = 1, pageSize = 12, status, ...otherParams } = queryParams;

      query.skip((+page - 1) * +pageSize);
      query.take(+pageSize);

      if (status) {
        query.andWhere('user.status=:status').setParameter('status', status);
      }

      if (otherParams) {
        Object.keys(otherParams).forEach((key) => {
          query.andWhere(`user.${key} LIKE :${key}`).setParameter(`${key}`, `%${otherParams[key]}%`);
        });
      }
    }

    return query.getManyAndCount();
  }

  /**
   * 创建用户
   * @param user 用户模型
   * @param ignoreValidator 是否忽略名称校验
   */
  async createUser(user: Partial<User>, ignoreValidator?: boolean): Promise<User> {
    const { name, password } = user;

    // 如果忽略了名称校验，来自于系统内部默认的注入
    if (!ignoreValidator) {
      if (!name || !password) {
        throw new HttpException('请输入用户名和密码', HttpStatus.BAD_REQUEST);
      }
  
      // 防止用户名称非法
      if (!isValidUsername(name)) {
        throw new HttpException('用户名不能包含空格和非法字符', HttpStatus.BAD_REQUEST);
      }
    }

    const existUser = await this.userRepository.findOne({ where: { name } });

    if (existUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.userRepository.create(user);
    await this.userRepository.save(newUser);
    return newUser;
  }

  /**
   * 用户登录
   * @param user
   */
  async login(user: Partial<User>): Promise<User> {
    const { name, password } = user;
    const existUser = await this.userRepository.findOne({ where: { name } });

    if (!existUser || !(await User.comparePassword(password, existUser.password))) {
      throw new HttpException(
        '用户名或密码错误',
        // tslint:disable-next-line: trailing-comma
        HttpStatus.BAD_REQUEST
      );
    }

    if (existUser.status === 'locked') {
      throw new HttpException(
        '用户已锁定，无法登录',
        // tslint:disable-next-line: trailing-comma
        HttpStatus.BAD_REQUEST
      );
    }

    delete existUser.password;

    return existUser;
  }

  /**
   * 无密码登录
   * @param user
   */
  async loginWithoutPasswd(user: Partial<User>): Promise<User> {
    const { name } = user;
    const existUser = await this.userRepository.findOne({ where: { name } });

    if (existUser.status === 'locked') {
      throw new HttpException(
        '用户已锁定，无法登录',
        // tslint:disable-next-line: trailing-comma
        HttpStatus.BAD_REQUEST
      );
    }

    delete existUser.password;

    return existUser;
  }

  /**
   * 获取指定用户
   * @param id
   */
  async findById(id): Promise<User> {
    return this.userRepository.findOne(id);
  }

  /**
   * 更新指定用户
   * @param id
   */
  async updateById(currentUser, id, user): Promise<User> {
    if (user.role === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        throw new HttpException(
          '您无权操作',
          // tslint:disable-next-line: trailing-comma
          HttpStatus.FORBIDDEN
        );
      }
    }

    const oldUser = await this.userRepository.findOne(id);
    delete user.password;

    if (user.name && user.name !== oldUser.name) {
      const existUser = await this.userRepository.findOne({ where: { name: user.name } });

      if (existUser) {
        throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
      }
    }

    const newUser = await this.userRepository.merge(oldUser, user);
    return this.userRepository.save(newUser);
  }

  /**
   * 更新指定用户密码
   * @param id
   */
  async updatePassword(id, user): Promise<User> {
    const existUser = await this.userRepository.findOne(id);
    const { oldPassword, newPassword } = user;

    if (!existUser || !(await User.comparePassword(oldPassword, existUser.password))) {
      throw new HttpException(
        '用户名或密码错误',
        // tslint:disable-next-line: trailing-comma
        HttpStatus.BAD_REQUEST
      );
    }

    const hashNewPassword = User.encryptPassword(newPassword);
    const newUser = await this.userRepository.merge(existUser, {
      password: hashNewPassword,
    });
    const d = await this.userRepository.save(newUser);
    return d;
  }
}
