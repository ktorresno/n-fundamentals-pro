import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/users.entity';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ArtistsService } from '../artists/artists.service';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
          },
        },
        {
          provide: ArtistsService,
          useValue: {
            findArtist: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token if validation is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const user = {
        id: 1,
        email: 'test@test.com',
        password: '$2a$10$hashedpassword', // bcrypt hash for "password"
      } as User;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(result).toEqual({
        accessToken: 'mock-token',
      });
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };
      const user = {
        id: 1,
        email: 'test@test.com',
        password: '$2a$10$hashedpassword',
      } as User;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should include artistId in payload if user is an artist', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const user = {
        id: 1,
        email: 'test@test.com',
        password: '$2a$10$hashedpassword',
      } as User;
      const artist = { id: 1 } as any;

      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(service['artistsService'], 'findArtist').mockResolvedValue(artist);

      await service.login(loginDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        userId: user.id,
        artistId: artist.id,
      });
    });
  });

  describe('passMatch', () => {
    it('should return true if password matches', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.passMatch('password', 'hash');
      expect(result).toBe(true);
    });

    it('should return false if password does not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.passMatch('password', 'hash');
      expect(result).toBe(false);
    });
  });

  describe('enable2FA', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      await expect(service.enable2FA(1)).rejects.toThrow(UnauthorizedException);
    });

    it('should return existing secret if 2FA is already enabled', async () => {
      const user = { id: 1, enable2FA: true, twoFASecret: 'secret' } as User;
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      const result = await service.enable2FA(1);
      expect(result).toEqual({ secret: 'secret' });
    });

    it('should generate new secret and update user if 2FA is disabled', async () => {
      const user = { id: 1, enable2FA: false } as User;
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(usersService, 'updateSecretKey').mockResolvedValue(undefined);

      const result = await service.enable2FA(1);

      expect(result).toHaveProperty('secret');
      expect(usersService.updateSecretKey).toHaveBeenCalled();
    });
  });
});
