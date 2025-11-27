import { Test, TestingModule } from '@nestjs/testing';
import { ArtistsService } from './artists.service';
import { Repository } from 'typeorm';
import { Artist } from './artists.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ArtistsService', () => {
  let service: ArtistsService;
  let repository: Repository<Artist>;

  const mockRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistsService,
        {
          provide: getRepositoryToken(Artist),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ArtistsService>(ArtistsService);
    repository = module.get<Repository<Artist>>(getRepositoryToken(Artist));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findArtist', () => {
    it('should return an artist when found', async () => {
      const userId = 1;
      const mockArtist = { id: 1, user: { id: userId } } as Artist;
      mockRepository.findOneBy.mockResolvedValue(mockArtist);

      const result = await service.findArtist(userId);

      expect(result).toEqual(mockArtist);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ user: { id: userId } });
    });

    it('should throw NotFoundException when artist is not found', async () => {
      const userId = 1;
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findArtist(userId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ user: { id: userId } });
    });
  });
});
