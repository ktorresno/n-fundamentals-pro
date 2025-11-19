import { Test, TestingModule } from '@nestjs/testing';
import { SongsModule } from './songs.module';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './songs.entity';
import { Artist } from '../artists/artists.entity';

import { Playlist } from '../playlists/playlist.entity';
import { User } from '../users/users.entity';

describe('SongsModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        SongsModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Song, Artist, Playlist, User],
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

  it('should provide SongsService', () => {
    const service = module.get<SongsService>(SongsService);
    expect(service).toBeDefined();
  });

  it('should provide SongsController', () => {
    const controller = module.get<SongsController>(SongsController);
    expect(controller).toBeDefined();
  });
});
