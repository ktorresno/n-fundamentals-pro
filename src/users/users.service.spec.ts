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
});
