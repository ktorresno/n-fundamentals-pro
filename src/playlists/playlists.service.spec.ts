import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PlaylistsService } from './playlists.service';
import { Playlist } from './playlist.entity';
import { Artist } from '../artists/artists.entity';
import { Song } from '../songs/songs.entity';
import { User } from '../users/users.entity';
import { CreatePlayListDto } from './dto/create-playlist-dto';

describe('PlaylistsService (unit)', () => {
  let playListService: PlaylistsService;
  let playListRepo: Repository<Playlist>;
  let userRepo: Repository<User>;
  let songRepo: Repository<Song>;
  let artistRepo: Repository<Artist>;
  let moduleRef: TestingModule;
  let songSaved: Song;
  let userSaved: User;
  let dataSource: DataSource;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Playlist, Artist, Song, User],
          synchronize: true,
          logging: false,
          retryAttempts: 0,
          retryDelay: 0,
        }),
        TypeOrmModule.forFeature([Playlist, Artist, Song, User]),
      ],
      providers: [PlaylistsService],
    }).compile();
    await moduleRef.init();

    playListService = moduleRef.get<PlaylistsService>(PlaylistsService);
    dataSource = moduleRef.get<DataSource>(DataSource);
    playListRepo = dataSource.getRepository(Playlist);
    userRepo = dataSource.getRepository(User);
    songRepo = dataSource.getRepository(Song);
    artistRepo = dataSource.getRepository(Artist);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    await moduleRef.close();
  });

  beforeEach(async () => {
    await dataSource.query('DELETE FROM songs_artists');
    await songRepo.clear();
    await playListRepo.clear();
    await artistRepo.clear();
    await userRepo.clear();

    userSaved = await userRepo.save({
      firstName: 'John',
      lastName: 'Doe',
      email: 'jndoe@gmail.com',
      password: 'password123',
      playLists: [],
    });

    const savedArtist = await artistRepo.save({
      user: userSaved,
      songs: [],
    });

    songSaved = await songRepo.save({
      title: 'Seed 1',
      // link by id to avoid FK ordering issues when saving relations
      artists: [{ id: savedArtist.id } as Artist],
      releasedDate: new Date('2020-01-01'),
      duration: new Date('1970-01-01T00:03:45Z'),
      lyrics: 'Lyrics 1',
    });

    const playlistSeed = await playListRepo.save({
      name: 'Seed Playlist 1',
      user: userSaved,
    });
    songSaved.playList = playlistSeed;
    await songRepo.save(songSaved);
  });

  it('should be defined', () => {
    expect(playListService).toBeDefined();
  });

  it('create() should create and save a playlist', async () => {
    await dataSource.query('DELETE FROM songs_artists');
    await songRepo.clear();
    await playListRepo.clear();
    await artistRepo.clear();
    await userRepo.clear();

    const userEntity1 = await userRepo.save({
      firstName: 'Yessica',
      lastName: 'Tolmer',
      email: 'yessyTol@gmail.com',
      password: 'password12345',
      playLists: [],
    });

    const savedArtist1 = await artistRepo.save({
      user: userEntity1,
      songs: [],
    });

    const songEntity1 = await songRepo.save({
      title: 'Song Seed 10',
      // link by id to avoid FK ordering issues when saving relations
      artists: [{ id: savedArtist1.id } as Artist],
      releasedDate: new Date('2023-01-10'),
      duration: new Date('1970-01-01T00:03:45Z'),
      lyrics: 'Lyrics of Song Seed 10',
    });

    const namePlayList = 'My Playlist 10';
    const playload: CreatePlayListDto = {
      name: namePlayList,
      user: userEntity1.id,
      songs: [songEntity1.id],
    };

    const res = await playListService.create(playload);
    expect(res).toBeDefined();
    expect(res.name).toBe(namePlayList);
    expect(res.user.id).toBe(userEntity1.id);
    expect(res.songs && res.songs.length).toBeGreaterThan(0);
    expect(res.songs[0].id).toBe(songEntity1.id);
  });

  it('findAll() should return repository.find result', async () => {
    const res = await playListService.findAll();
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].user).toBeDefined();
    expect(res[0].songs).toBeDefined();
  });

  it('findOne() should return entity or throw', async () => {
    const seeded = await playListService.findAll();
    const targetId = seeded[0].id;
    await expect(playListService.findOne(targetId)).resolves.toHaveProperty(
      'id',
      targetId,
    );
    await expect(playListService.findOne(999999)).rejects.toThrow();
  });

  it('update() should call repo.update when exists', async () => {
    const seeded = await playListService.findAll();
    const idToUpdate = seeded[0].id;
    await playListService.update(idToUpdate, { name: 'Updated Playlist' });
    const updated = await playListService.findOne(idToUpdate);
    expect(updated.name).toBe('Updated Playlist');
  });

  it('create() should throw if user not found', async () => {
    const playload: CreatePlayListDto = {
      name: 'Bad User Playlist',
      user: 99999,
      songs: [],
    };
    await expect(playListService.create(playload)).rejects.toThrow(
      'User with id 99999 was not found',
    );
  });

  it('update() should throw if user not found', async () => {
    const seeded = await playListService.findAll();
    const idToUpdate = seeded[0].id;
    await expect(
      playListService.update(idToUpdate, { user: 99999 }),
    ).rejects.toThrow('User with id 99999 was not found');
  });

  it('update() should handle partial updates (name only)', async () => {
    const seeded = await playListService.findAll();
    const idToUpdate = seeded[0].id;
    await playListService.update(idToUpdate, { name: 'New Name Only' });
    const updated = await playListService.findOne(idToUpdate);
    expect(updated.name).toBe('New Name Only');
  });

  it('update() should handle partial updates (user only)', async () => {
    const seeded = await playListService.findAll();
    const idToUpdate = seeded[0].id;
    // Create another user
    const user2 = await userRepo.save({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janedoe@gmail.com',
      password: 'password123',
      playLists: [],
    });

    await playListService.update(idToUpdate, { user: user2.id });
    const updated = await playListService.findOne(idToUpdate);
    expect(updated.user.id).toBe(user2.id);
  });

  it('update() should handle partial updates (songs only)', async () => {
    const seeded = await playListService.findAll();
    const idToUpdate = seeded[0].id;
    // Create another song
    const song2 = await songRepo.save({
      title: 'Song 2',
      artists: [],
      releasedDate: new Date(),
      duration: new Date('1970-01-01T00:03:00Z'),
      lyrics: 'L2',
    });

    await playListService.update(idToUpdate, { songs: [song2.id] });
    const updated = await playListService.findOne(idToUpdate);
    expect(updated.songs.length).toBe(1);
    expect(updated.songs[0].id).toBe(song2.id);
  });

  it('remove() should call repo.delete when exists', async () => {
    const seeded = await playListService.findAll();
    const idToDelete = seeded[0].id;
    await playListService.remove(idToDelete);
    await expect(playListService.findOne(idToDelete)).rejects.toThrow();
  });

  it('paginate() should return paginated results', async () => {
    const res = await playListService.paginate({ page: 1, limit: 10 });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.meta.totalItems).toBeGreaterThan(0);
  });
});
