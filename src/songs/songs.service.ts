import { DeleteResult, In, Repository, UpdateResult } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Artist } from '../artists/artists.entity';
import { Song } from './songs.entity';
import { CreateSongDto } from './dto/create-song-dto';
import { UpdateSongDto } from './dto/update-song-dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songRepository: Repository<Song>,
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}
  async create(songDto: CreateSongDto): Promise<Song> {
    // find all the artists by their IDs
    const artists = await this.artistRepository.findBy({
      id: In(songDto.artists || []),
    });

    const song = this.songRepository.create({
      ...songDto,
      artists,
    });
    return await this.songRepository.save(song);
  }

  findAll(): Promise<Song[]> {
    return this.songRepository.find();
  }

  findOne(id: number): Promise<Song | null> {
    return this.songRepository.findOneBy({ id });
  }

  update(id: number, recordToUpdate: UpdateSongDto): Promise<UpdateResult> {
    return this.songRepository.update(id, recordToUpdate);
  }

  remove(id: number): Promise<DeleteResult> {
    return this.songRepository.delete(id);
  }

  paginate(options: IPaginationOptions): Promise<Pagination<Song>> {
    const queryBuilder = this.songRepository.createQueryBuilder('song');
    queryBuilder.orderBy('song.releasedDate', 'DESC');

    return paginate<Song>(queryBuilder, options);
  }
}
