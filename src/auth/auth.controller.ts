import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user-dto';
import { LoginDto } from './dtos/login.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt.auth.guard';
import { Enable2FA } from 'src/types/auth-types';
import { ValidateTokenDTO } from './dtos/validate-token.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('signup')
  signup(@Body() userDTO: CreateUserDto) {
    return this.usersService.create(userDTO);
  }

  @Post('login')
  login(@Body() loginDTO: LoginDto) {
    return this.authService.login(loginDTO);
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  enable2FA(
    @Request()
    req,
  ): Promise<Enable2FA> {
    return this.authService.enable2FA(req.user.userId);
  }

  @Get('disable-2fa')
  @UseGuards(JwtAuthGuard)
  disable2FA(
    @Request()
    req,
  ): Promise<void> {
    return this.authService.disable2FA(req.user.userId);
  }

  @Post('validate-2fa')
  @UseGuards(JwtAuthGuard)
  validate2FA(
    @Request()
    req,
    @Body()
    validateTokenDTO: ValidateTokenDTO,
  ): Promise<{ verified: boolean }> {
    return this.authService.validate2FAToken(
      req.user.userId,
      validateTokenDTO.token,
    );
  }
}