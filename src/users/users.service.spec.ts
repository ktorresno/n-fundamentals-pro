import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { Playlist } from '../playlists/playlist.entity';
import { Song } from '../songs/songs.entity';
import { Artist } from '../artists/artists.entity';

describe('UsersService', () => {
  let userService: UsersService;
  let userRepo: Repository<User>;
  let playListRepo: Repository<Playlist>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Playlist, Song, Artist],
          synchronize: true,
          logging: false,
          retryAttempts: 0,
          retryDelay: 0,
        }),
        TypeOrmModule.forFeature([User, Playlist, Song, Artist]),
      ],
      providers: [UsersService],
    }).compile();

    await moduleRef.init();
    userService = moduleRef.get<UsersService>(UsersService);
    userRepo = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    playListRepo = moduleRef.get<Repository<Playlist>>(
      getRepositoryToken(Playlist),
    );
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await userRepo.clear();
    await playListRepo.clear();
  });

  it('should return seeded users via service', async () => {
    const all = await userService.findAll();
    expect(all.length).toBe(0);
  });

  it('create() should save user with hashed password', async () => {
    const dto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'password123',
    };
    const created = await userService.create(dto);
    expect(created).toBeDefined();
    expect((created as any).password).toBeUndefined();
    expect(created.email).toBe('test@test.com');

    const savedUser = await userRepo.findOneBy({ id: created.id });
    expect(savedUser).toBeDefined();
    expect(savedUser!.password).not.toBe('password123');
    expect(savedUser!.password).not.toBe('');
  });

  it('create() should throw ConflictException if user already exists', async () => {
    const dto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'password123',
    };
    await userService.create(dto);
    await expect(userService.create(dto)).rejects.toThrow(ConflictException);
  });

  it('findAll() should return all users', async () => {
    await userRepo.save({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      password: 'p',
      playLists: [],
    });
    const all = await userService.findAll();
    expect(all.length).toBeGreaterThan(0);
  });

  it('findOne() should return user by id', async () => {
    const saved = await userRepo.save({
      firstName: 'C',
      lastName: 'D',
      email: 'c@d.com',
      password: 'p',
      playLists: [],
    });
    const found = await userService.findOne(saved.id);
    expect(found?.id).toBe(saved.id);
  });

  it('create() should throw generic error if save fails', async () => {
    const dto = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      password: 'password123',
    };
    const spy = jest
      .spyOn(userRepo, 'save')
      .mockRejectedValueOnce(new Error('Generic error'));
    await expect(userService.create(dto)).rejects.toThrow('Generic error');
    spy.mockRestore();
  });

  it('findOneByEmail() should return user if found', async () => {
    const saved = await userRepo.save({
      firstName: 'E',
      lastName: 'F',
      email: 'e@f.com',
      password: 'p',
      playLists: [],
    });
    const found = await userService.findOneByEmail('e@f.com');
    expect(found.id).toBe(saved.id);
  });

  it('findOneByEmail() should throw UnauthorizedException if user not found', async () => {
    await expect(
      userService.findOneByEmail('nonexistent@test.com'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('updateSecretKey() should update user secret', async () => {
    const updateResult = { affected: 1 } as any;
    jest.spyOn(userRepo, 'update').mockResolvedValue(updateResult);
    const result = await userService.updateSecretKey(1, 'secret');
    expect(result).toBe(updateResult);
    expect(userRepo.update).toHaveBeenCalledWith(
      { id: 1 },
      { twoFASecret: 'secret', enable2FA: true },
    );
  });
});
