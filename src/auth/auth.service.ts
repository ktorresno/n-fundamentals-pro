import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ArtistsService } from '../artists/artists.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dtos/login.dto';
import { PayloadType } from '../types/payLoad.type';
import { Enable2FA } from '../types/auth-types';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly artistsService: ArtistsService,
    ) {}

    async login(loginDTO: LoginDto): Promise<{ accessToken: string }> {
        const user = await this.usersService.findOneByEmail(loginDTO.email);
        if (user && (await this.passMatch(loginDTO.password, user.password))) {
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

    async enable2FA(userId: number): Promise<Enable2FA> {
        try {
            const user = await this.usersService.findOne(userId);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            if (!user.enable2FA) {
                const secret = speakeasy.generateSecret();
                user.twoFASecret = secret.base32;
                await this.usersService.updateSecretKey(user.id, user.twoFASecret);
            }
            return { secret: user.twoFASecret };
        } catch (error) {
            throw new UnauthorizedException('Error enabling two factor authentication');
        }
    }

    async disable2FA(userId: number): Promise<void> {
        this.usersService.disable2FA(userId);
    }

    async validate2FAToken(userId: number, token: string): Promise<{ verified: boolean }> {
        try {
            const user = await this.usersService.findOne(userId);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            const verified = speakeasy.totp.verify({
                secret: user.twoFASecret,
                token: token,
                encoding: 'base32',
            });
            return { verified };
        } catch (error) {
            throw new UnauthorizedException('Error validating token');
        }
    }
}
