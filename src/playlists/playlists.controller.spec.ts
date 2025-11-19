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
      paginate: jest.fn(),
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

  it('create should propagate errors', async () => {
    const err = new Error('create failed');
    service.create!.mockRejectedValue(err);
    await expect(controller.create({ name: 'P', user: 1, songs: [] })).rejects.toThrow(
      'Error mientras se creaba el registro para la Playlist',
    );
  });

  it('findAll should call service.findAll', async () => {
    const list = [{ id: 1 }] as Playlist[];
    service.findAll!.mockResolvedValue(list);
    await expect(controller.findAll()).resolves.toBe(list);
  });

  it('findAll should propagate errors', async () => {
    const err = new Error('findAll failed');
    service.findAll!.mockRejectedValue(err);
    await expect(controller.findAll()).rejects.toThrow(
      'Error al buscar todos los elementos.',
    );
  });

  it('findAll with pagination should call service.paginate', async () => {
    const pagination = { items: [], meta: {}, links: {} };
    service.paginate!.mockResolvedValue(pagination);
    await expect(controller.findAll('1', '10')).resolves.toBe(pagination);
    expect(service.paginate).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('findAll with pagination should propagate errors', async () => {
    const err = new Error('paginate failed');
    service.paginate!.mockRejectedValue(err);
    await expect(controller.findAll('1', '10')).rejects.toThrow(
      'Error al buscar todos los elementos.',
    );
  });

  it('findOne should call service.findOne', async () => {
    const p = { id: 1 } as Playlist;
    service.findOne!.mockResolvedValue(p);
    await expect(controller.findOne(1)).resolves.toBe(p);
  });

  it('findOne should propagate errors', async () => {
    const err = new Error('findOne failed');
    service.findOne!.mockRejectedValue(err);
    await expect(controller.findOne(1)).rejects.toThrow(
      `Error mientras se buscaba el registro de 'Playlist' con ID: 1`,
    );
  });

  it('update should delegate to service.update', async () => {
    service.update!.mockResolvedValue({} as any);
    await controller.update(1, { name: 'X' });
    expect(service.update).toHaveBeenCalledWith(1, { name: 'X' });
  });

  it('update should propagate errors', async () => {
    const err = new Error('update failed');
    service.update!.mockRejectedValue(err);
    await expect(controller.update(1, { name: 'X' })).rejects.toThrow(
      `Error mientras se actualizaba el registro de 'Playlist' con ID: 1`,
    );
  });

  it('remove should delegate to service.remove', async () => {
    service.remove!.mockResolvedValue({} as any);
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('remove should propagate errors', async () => {
    const err = new Error('remove failed');
    service.remove!.mockRejectedValue(err);
    await expect(controller.remove(1)).rejects.toThrow(
      `Error mientras se eliminaba el registro de 'Playlist' con ID: 1`,
    );
  });
});
