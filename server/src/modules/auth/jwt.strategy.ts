import { ApiMsg } from '../../common/api-messages';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '../user/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'reactpress',
    });
  }

  async validate(payload: User) {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException(ApiMsg.AUTH_FAILED);
    }
    return user;
  }
}
