import { Test } from '@nestjs/testing';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { Playlist } from './playlist.entity';

describe('PlaylistsController', () => {
  let controller: PlaylistsController;
  let service: Partial<Record<keyof PlaylistsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [{ provide: PlaylistsService, useValue: service }],
    }).compile();

    controller = module.get(PlaylistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create should delegate to service.create', async () => {
    const payload = { name: 'P' } as Partial<Playlist>;
    const saved = { id: 1, ...payload } as Playlist;
    service.create!.mockResolvedValue(saved);
    await expect(controller.create(payload)).resolves.toEqual(saved);
    expect(service.create).toHaveBeenCalledWith(payload);
  });

  it('findAll should call service.findAll', async () => {
    const list = [{ id: 1 }] as Playlist[];
    service.findAll!.mockResolvedValue(list);
    await expect(controller.findAll()).resolves.toBe(list);
  });

  it('findOne should call service.findOne', async () => {
    const p = { id: 1 } as Playlist;
    service.findOne!.mockResolvedValue(p);
    await expect(controller.findOne('1' as unknown as number)).resolves.toBe(p);
  });

  it('update should delegate to service.update', async () => {
    service.update!.mockResolvedValue({} as any);
    await controller.update(1, { name: 'X' });
    expect(service.update).toHaveBeenCalledWith(1, { name: 'X' });
  });

  it('remove should delegate to service.remove', async () => {
    service.remove!.mockResolvedValue({} as any);
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
