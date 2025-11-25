import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDTO: LoginDto): Promise<{ status: number, message: string, accessToken: string }> {
        const user = await this.usersService.findOneByEmail(loginDTO.email);
        let response = { status: 401, message: `Invalid password for user with email: ${loginDTO.email}`, accessToken: '' };

        if ((await this.passMatch(loginDTO.password, user.password))) {
            const payload = { email: user.email, sub: user.id };
            response = { status: 200, message: `Login successful!`, accessToken: this.jwtService.sign({ payload }) };
        }
        return response;
    }

    async passMatch(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

}
