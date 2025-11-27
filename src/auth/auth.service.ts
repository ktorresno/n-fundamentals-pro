import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ArtistsService } from '../artists/artists.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { PayloadType } from 'src/types/payLoad.type';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly artistsService: ArtistsService,
    ) {}

    async login(loginDTO: LoginDto): Promise<{ accessToken: string }> {
        const user = await this.usersService.findOneByEmail(loginDTO.email);
        if ((await this.passMatch(loginDTO.password, user.password))) {
            const payload: PayloadType = { email: user.email, userId: user.id };
            const artist = await this.artistsService.findArtist(user.id);
            if (artist) {
                payload.artistId = artist.id;
            }
            return { accessToken: this.jwtService.sign(payload) };
        } else
            throw new UnauthorizedException('Invalid credentials');
    }

    async passMatch(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

}
