import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { Song } from './songs.entity';
import { CreateSongDto } from './dto/create-song-dto';
import { UpdateSongDto } from './dto/update-song-dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { error } from 'node:console';

describe('SongsController (unit)', () => {
  let controller: SongsController;
  let service: Partial<Record<keyof SongsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      paginate: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [{ provide: SongsService, useValue: service }],
    }).compile();

    controller = module.get<SongsController>(SongsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to service.create and returns song', async () => {
      const dto = { title: 'T' } as CreateSongDto;
      const song = { id: 1, title: 'T' } as Song;
      service.create!.mockResolvedValue(song);

      await expect(controller.create(dto)).resolves.toBe(song);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('propagates service errors', async () => {
      const dto = { title: 'X' } as CreateSongDto;
      const err = new HttpException(
        'Error mientras se creaba el registro de Song.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
      service.create!.mockRejectedValue(err);

      await expect(controller.create(dto)).rejects.toStrictEqual(err);
    });
  });

  describe('findAll', () => {
    it('returns all songs when no pagination params provided', async () => {
      const list = [{ id: 1 }] as Song[];
      service.findAll!.mockResolvedValue(list);

      const res = await controller.findAll(undefined, undefined);
      expect(service.findAll).toHaveBeenCalled();
      expect(res).toBe(list);
    });

    it('wraps errors from non-paginated findAll', async () => {
      const err = new Error('boom');
      service.findAll!.mockRejectedValue(err);

      await expect(controller.findAll(undefined, undefined)).rejects.toMatchObject({
        message: 'Error al buscar todos los elementos.',
        cause: err,
      });
    });

    it('paginates when page/limit provided and caps limit at 100', async () => {
      const pagination = { items: [], meta: {}, links: {} };
      service.paginate!.mockResolvedValue(pagination);

      const res = await controller.findAll('1', '999');
      expect(service.paginate).toHaveBeenCalledWith({ page: 1, limit: 100 });
      expect(res).toBe(pagination);
    });

    it('wraps paginate errors in HttpException', async () => {
      const err = new Error('boom');
      service.paginate!.mockRejectedValue(err);

      await expect(controller.findAll('1', '10')).rejects.toMatchObject({
        message: 'Error al buscar todos los elementos.',
        cause: err,
      });
    });
  });

  describe('findOne', () => {
    it('returns a song by id', async () => {
      const song = { id: 2 } as Song;
      service.findOne!.mockResolvedValue(song);

      await expect(controller.findOne(2)).resolves.toBe(song);
      expect(service.findOne).toHaveBeenCalledWith(2);
    });

    it('throws HttpException when service.findOne fails', async () => {
      const err = new Error('notfound');
      service.findOne!.mockRejectedValue(err);

      await expect(controller.findOne(99)).rejects.toMatchObject({
        message: 'Error mientras se buscaba el registro con ID: 99',
        cause: err,
      });
    });
  });

  describe('update', () => {
    it('returns UpdateResult from service', async () => {
      const dto = { title: 'U' } as UpdateSongDto;
      const result = { affected: 1 } as UpdateResult;
      service.update!.mockResolvedValue(result);

      await expect(controller.update(5, dto)).resolves.toBe(result);
      expect(service.update).toHaveBeenCalledWith(5, dto);
    });

    it('throws HttpException when update fails', async () => {
      const err = new Error('upfail');
      service.update!.mockRejectedValue(err);

      await expect(controller.update(5, {} as UpdateSongDto)).rejects.toMatchObject({
        message: 'Error mientras se actualizaba el registro con ID: 5',
        cause: err,
      });
    });
  });

  describe('delete', () => {
    it('returns DeleteResult from service', async () => {
      const dr = { affected: 1 } as DeleteResult;
      service.remove!.mockResolvedValue(dr);

      await expect(controller.delete(7)).resolves.toBe(dr);
      expect(service.remove).toHaveBeenCalledWith(7);
    });

    it('throws HttpException when delete fails', async () => {
      const err = new Error('delfail');
      service.remove!.mockRejectedValue(err);

      await expect(controller.delete(7)).rejects.toMatchObject({
        message: 'Error mientras se eliminaba el registro con ID: 7',
        cause: err,
      });
    });
  });
});
