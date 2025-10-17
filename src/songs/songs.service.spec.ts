import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from './songs.service';
import { getConnectionFromConfig } from '../common/constants/connection';

describe('SongsService', () => {
  let service: SongsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: 'CONNECTION',
          useValue: getConnectionFromConfig(), // This is an existing connection object
        },
      ],
    }).compile();

    service = await module.resolve<SongsService>(SongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
