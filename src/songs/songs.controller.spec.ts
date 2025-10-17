import { Test, TestingModule } from '@nestjs/testing';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { getConnectionFromConfig } from '../common/constants/connection';

describe('SongsController', () => {
  let controller: SongsController;
  let service: SongsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [
        SongsService,
        {
          provide: 'CONNECTION',
          useValue: getConnectionFromConfig(), // This is an existing connection object
        },
      ],
    }).compile();

    controller = await module.resolve<SongsController>(SongsController);
    service = await module.resolve<SongsService>(SongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });
});
