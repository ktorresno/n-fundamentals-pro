import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user-dto';
import { LoginDto } from './dtos/login.dto';
import { User } from '../users/users.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'password',
      };
      const result = { id: 1, ...createUserDto } as User;

      jest.spyOn(usersService, 'create').mockResolvedValue(result);

      expect(await controller.signup(createUserDto)).toBe(result);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };
      const result = {
        accessToken: 'mock-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await controller.login(loginDto)).toBe(result);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
