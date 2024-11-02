import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { SettingModule } from '../setting/setting.module';
import { SMTPModule } from '../smtp/smtp.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

const passModule = PassportModule.register({ defaultStrategy: 'jwt' });
const jwtModule = JwtModule.register({
  secret: 'reactpress',
  signOptions: { expiresIn: '4h' },
});

@Module({
  imports: [
    forwardRef(() => UserModule),
    passModule,
    jwtModule,
    forwardRef(() => SettingModule),
    forwardRef(() => SMTPModule),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [passModule, jwtModule],
})
export class AuthModule {}
