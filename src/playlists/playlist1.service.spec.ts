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
  let userRepository: Repository<User>;
  let songRepo: Repository<Song>;
  let artistRepo: Repository<Artist>;
  let moduleRef: TestingModule;
  let dataSource: DataSource;
  let userSaved: User;
  let songSaved: Song;

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
    userRepository = dataSource.getRepository(User);
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
    await userRepository.clear();

    const userEntity = userRepository.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'jndoe@gmail.com',
      password: 'password123',
      playLists: [],
    });
    userSaved = await userRepository.save(userEntity);

    const savedArtist = await artistRepo.save({
      user: userSaved,
      songs: [],
    });

    songSaved = await songRepo.save({
      title: 'Seed 1',
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
    // ensure clean state
    await dataSource.query('DELETE FROM songs_artists');
    await songRepo.clear();
    await playListRepo.clear();
    await artistRepo.clear();
    await userRepository.clear();

    const userEntity1 = await userRepository.save({
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
      artists: [{ id: savedArtist1.id } as Artist],
      releasedDate: new Date('2023-01-10'),
      duration: new Date('1970-01-01T00:03:45Z'),
      lyrics: 'Lyrics of Song Seed 10',
    });

    const namePlayList = 'My Playlist 10';
    // use service with full relation objects to avoid FK cascade issues
    const payload: CreatePlayListDto = {
      name: namePlayList,
      user: userEntity1.id,
      songs: [songEntity1.id, userSaved.id ? songSaved.id : 1],
    };

    const created = await playListService.create(payload);

    expect(created).toBeDefined();
    expect(created.name).toBe(namePlayList);
    expect(created.user.id).toBe(userEntity1.id);
    expect(created.songs && created.songs.length).toBeGreaterThan(0);
  });

  it('should return seeded playlists via service', async () => {
    const all = await playListService.findAll();
    expect(all.length).toBeGreaterThan(0);
    expect(all[0].name).toBe('Seed Playlist 1');
    expect(all.length).toBe(1);
  });

  it('findAll() should return repository.find result', async () => {
    const list = [
      { id: 1, name: 'P1', user: userSaved, songs: [songSaved] } as Playlist,
    ];
    const findSpy = jest
      .spyOn(playListRepo, 'find')
      .mockResolvedValueOnce(list);

    const res = await playListService.findAll();
    expect(findSpy).toHaveBeenCalledWith({
      relations: ['user', 'songs'],
    });
    expect(res).toBe(list);
    findSpy.mockRestore();
  });

  it('findOne() should return entity or throw', async () => {
    const entity = { id: 2, name: 'P2' } as Playlist;
    const findOneSpy = jest.spyOn(playListRepo, 'findOne').mockResolvedValueOnce(entity);
    await expect(playListService.findOne(2)).resolves.toBe(entity);
    findOneSpy.mockRestore();

    const findOneSpy2 = jest.spyOn(playListRepo, 'findOne').mockResolvedValueOnce(null);
    await expect(playListService.findOne(999)).rejects.toThrow();
    findOneSpy2.mockRestore();
  });

  it('update() should call repo.update when exists', async () => {
    const findOneSpy = jest.spyOn(playListRepo, 'findOne').mockResolvedValue({ id: 3 } as Playlist);
    const updateSpy = jest.spyOn(playListRepo, 'update').mockResolvedValueOnce({} as any);
    await playListService.update(3, { name: 'X' });
    expect(findOneSpy).toHaveBeenCalledWith({ where: { id: 3 }, relations: ['user', 'songs'] });
    expect(updateSpy).toHaveBeenCalledWith(3, { name: 'X' });
    findOneSpy.mockRestore();
    updateSpy.mockRestore();
  });

  it('remove() should call repo.delete when exists', async () => {
    const findOneSpy = jest.spyOn(playListRepo, 'findOne').mockResolvedValueOnce({ id: 4 } as Playlist);
    const deleteSpy = jest.spyOn(playListRepo, 'delete').mockResolvedValueOnce({} as any);
    await playListService.remove(4);
    expect(findOneSpy).toHaveBeenCalledWith({ where: { id: 4 }, relations: ['user', 'songs'] });
    expect(deleteSpy).toHaveBeenCalledWith(4);
    findOneSpy.mockRestore();
    deleteSpy.mockRestore();
  });
});
