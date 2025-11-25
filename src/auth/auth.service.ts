import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDTO: LoginDto): Promise<{ accessToken: string }> {
        const user = await this.usersService.findOneByEmail(loginDTO.email);
        if ((await this.passMatch(loginDTO.password, user.password))) {
            const payload = { email: user.email, sub: user.id };
            return { accessToken: this.jwtService.sign(payload) };
        } else
            throw new UnauthorizedException('Invalid credentials');
    }

    async passMatch(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

}
