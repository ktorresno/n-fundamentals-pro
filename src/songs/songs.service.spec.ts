import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SongsService } from './songs.service';
import { Song } from './songs.entity';
import { Artist } from '../artists/artists.entity';
import { Playlist } from '../playlists/playlist.entity';
import { User } from '../users/users.entity';
import { CreateSongDto } from './dto/create-song-dto';
import { UpdateSongDto } from './dto/update-song-dto';

describe('Songs (integration)', () => {
  let service: SongsService;
  let repo: Repository<Song>;
  let artistRepo: Repository<Artist>;
  let moduleRef: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Song, Artist, Playlist, User],
          synchronize: true,
          logging: false,
          retryAttempts: 0,
          retryDelay: 0,
        }),
        TypeOrmModule.forFeature([Song, Artist]),
      ], //[SongsService],
      providers: [SongsService],
    }).compile();
    // ensure full initialization before using providers
    await moduleRef.init();

    service = moduleRef.get<SongsService>(SongsService);
    repo = moduleRef.get<Repository<Song>>(getRepositoryToken(Song));
    artistRepo = moduleRef.get<Repository<Artist>>(getRepositoryToken(Artist));
    dataSource = moduleRef.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    await moduleRef.close();
  });

  beforeEach(async () => {
    // clear songs and related tables to avoid FK constraint failures
    await repo.clear();
    await dataSource.query('DELETE FROM songs_artists');
    const userRepo = dataSource.getRepository(User);
    await artistRepo.clear();
    await userRepo.clear();

    const user1: User = userRepo.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'jndoe@gmail.com',
      password: 'password123',
      playLists: [],
    });
    const savedUser = await userRepo.save(user1);

    const artist1: Artist = artistRepo.create({
      user: savedUser,
      songs: [],
    });
    const savedArtist = await artistRepo.save(artist1);

    await repo.save({
      title: 'Seed 1',
      // link by id to avoid FK ordering issues when saving relations
      artists: [{ id: savedArtist.id } as Artist],
      releasedDate: new Date('2020-01-01'),
      duration: new Date('1970-01-01T00:03:45Z'),
      lyrics: 'Lyrics 1',
    });
  });

  it('should return seeded songs via service', async () => {
    const all = await service.findAll();
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].title).toBe('Seed 1');
    expect(all.length).toBe(1);
  });

  it('findOne should return a song by id', async () => {
    const [seed] = await service.findAll();
    const found = await service.findOne(seed.id);

    expect(found?.id).toBe(seed.id);
    expect(found?.title).toBe(seed.title);
  });

  it('create() should save and return a song', async () => {
    await dataSource.query('DELETE FROM songs_artists');
    const artistRepo2 = dataSource.getRepository(Artist);
    await artistRepo2.clear();
    const userRepo2 = dataSource.getRepository(User);
    await userRepo2.clear();

    const user2 = userRepo2.create({
      firstName: 'Steve',
      lastName: 'Jobs',
      email: 'stevejobs@gmail.com',
      password: 'password123',
      playLists: [],
    });
    const savedUser2 = await userRepo2.save(user2);

    const artist2: Artist = artistRepo2.create({
      user: savedUser2,
      songs: [],
    });

    const savedArtist2 = await artistRepo2.save(artist2);
    const dto: CreateSongDto = {
      title: 'T',
      releasedDate: new Date(),
      duration: new Date('1970-01-01T00:02:56Z'),
      lyrics: 'L',
      // link by id to avoid FK ordering issues when saving relations (same approach as the seed)
      artists: [{ id: savedArtist2.id } as Artist],
    };
    const created = await service.create(dto);
    expect(created).toBeDefined();

    const all = await service.findAll();
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].title).toBe('Seed 1');
    expect(all[1].title).toBe('T');
    expect(all.length).toBe(2);
  });

  it('create() should handle no artists provided', async () => {
    const dto: CreateSongDto = {
      title: 'No Artist Song',
      releasedDate: new Date(),
      duration: new Date('1970-01-01T00:03:00Z'),
      lyrics: 'L',
    } as unknown as CreateSongDto;
    const created = await service.create(dto);
    expect(created).toBeDefined();
    expect(created.artists).toEqual([]);
  });

  it('update should persist song changes', async () => {
    const [seed] = await service.findAll();
    const newTitle = 'Updated Title';

    await service.update(seed.id, {
      title: newTitle,
    } as UpdateSongDto);

    const updated = await service.findOne(seed.id);
    expect(updated?.title).toBe(newTitle);
  });

  it('remove should delete the song', async () => {
    const [seed] = await service.findAll();
    const result = await service.remove(seed.id);

    expect(result.affected).toBe(1);
    const afterRemoval = await service.findOne(seed.id);
    expect(afterRemoval).toBeNull();
  });

  it('paginate should return a limited set of songs', async () => {
    const [seedArtist] = await dataSource.getRepository(Artist).find();

    await service.create({
      title: 'Extra 1',
      releasedDate: new Date('2022-01-02'),
      duration: new Date('1970-01-01T00:04:00Z'),
      lyrics: 'Lyrics extra 1',
      artists: [{ id: seedArtist.id } as Artist],
    });

    await service.create({
      title: 'Extra 2',
      releasedDate: new Date('2023-01-03'),
      duration: new Date('1970-01-01T00:05:00Z'),
      lyrics: 'Lyrics extra 2',
      artists: [{ id: seedArtist.id } as Artist],
    });

    const page = await service.paginate({ page: 1, limit: 2 });

    expect(page.items.length).toBe(2);
    const titles = page.items.map((item) => item.title);
    expect(titles).toContain('Extra 2');

    const page2 = await service.paginate({ page: 2, limit: 2 });
    expect(page2.items.length).toBe(1);
    expect(page.meta.totalItems).toBe(3);
    expect(page.meta.totalItems).toBe(page2.meta.totalItems);
  });
});
