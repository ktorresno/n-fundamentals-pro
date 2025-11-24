import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/users/users.entity';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async login(loginDTO: LoginDto): Promise<Omit<User, 'password'>> {
        const user = await this.usersService.findOneByEmail(loginDTO.email);

        if (!(await this.passMatch(loginDTO.password, user.password))) {
            throw new Error(`Invalid password for user with email: ${loginDTO.email}`);
        }
        const { password, ...result } = user;
        return result;
    }

    async passMatch(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

}
