import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsModule } from './playlists.module';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './playlist.entity';
import { Song } from '../songs/songs.entity';
import { User } from '../users/users.entity';
import { Artist } from '../artists/artists.entity';

describe('PlaylistsModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        PlaylistsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Playlist, Song, User, Artist],
          synchronize: true,
          dropSchema: true,
        }),
      ],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PlaylistsService', () => {
    const service = module.get<PlaylistsService>(PlaylistsService);
    expect(service).toBeDefined();
  });

  it('should provide PlaylistsController', () => {
    const controller = module.get<PlaylistsController>(PlaylistsController);
    expect(controller).toBeDefined();
  });
});
