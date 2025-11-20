import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user-dto';
import { User } from '../users/users.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: UsersService) {}

    @Post()
    signup(
        @Body()
        userDTO: CreateUserDto
    ) {
        return this.authService.create(userDTO);
    }
}
