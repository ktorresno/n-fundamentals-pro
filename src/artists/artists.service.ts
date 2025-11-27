import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './artists.entity';

@Injectable()
export class ArtistsService {
    constructor(
        @InjectRepository(Artist)
        private readonly artistsRepository: Repository<Artist>,
    ) {}

    async findArtist(userId: number): Promise<Artist> {
      const artist = await this.artistsRepository.findOneBy({ user: { id: userId } });
      if (!artist) {
        throw new NotFoundException(`Artist not found`);
      }
      return artist;
    }
}
