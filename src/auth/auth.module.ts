import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { authConstants } from './auth.constants';
import { JWTStrategy } from './jwt-strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: authConstants.JWT_SECRET,
      signOptions: {
        expiresIn: authConstants.JWT_EXPIRATION,
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy],
  exports: [AuthService],
})
export class AuthModule {}
