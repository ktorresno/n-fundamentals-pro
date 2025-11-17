import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, In } from 'typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { Playlist } from './playlist.entity';
import { Song } from '../songs/songs.entity';
import { User } from '../users/users.entity';
import { CreatePlayListDto } from './dto/create-playlist-dto';
import { UpdatePlayListDto } from './dto/update-playlist-dto';

@Injectable()
export class PlaylistsService {
  private readonly playlistRelations: Array<keyof Playlist> = ['user', 'songs'];

  constructor(
    @InjectRepository(Playlist)
    private readonly playListRepo: Repository<Playlist>,
    @InjectRepository(Song)
    private readonly songRepo: Repository<Song>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(playListDTO: CreatePlayListDto): Promise<Playlist> {
    const user = await this.userRepo.findOneBy({ id: playListDTO.user });
    if (!user) {
      throw new NotFoundException(
        `User with id ${playListDTO.user} was not found`,
      );
    }

    const playList = this.playListRepo.create({
      name: playListDTO.name,
      user,
    });
    const saved = await this.playListRepo.save(playList);
    await this.attachSongs(saved, playListDTO.songs);

    return this.findOne(saved.id);
  }

  findAll(): Promise<Playlist[]> {
    return this.playListRepo.find({ relations: this.playlistRelations });
  }

  async findOne(id: number): Promise<Playlist> {
    return this.getPlaylistOrFail(id);
  }

  async update(id: number, payload: UpdatePlayListDto): Promise<Playlist> {
    const existing = await this.getPlaylistOrFail(id);

    let user: User | null = null;
    if (payload.user !== undefined) {
      user = await this.userRepo.findOneBy({ id: payload.user });
      if (!user) {
        throw new NotFoundException(
          `User with id ${payload.user} was not found`,
        );
      }
    }

    const updates: Partial<Playlist> = {};
    if (payload.name !== undefined) {
      updates.name = payload.name;
    }
    if (user) {
      updates.user = user;
    }

    if (Object.keys(updates).length) {
      await this.playListRepo.update(id, updates);
    }

    if (payload.songs !== undefined) {
      await this.detachSongs(existing.id);
      await this.attachSongs(existing, payload.songs);
    }

    return this.getPlaylistOrFail(id);
  }

  async remove(id: number): Promise<DeleteResult> {
    await this.getPlaylistOrFail(id); // ensure exists
    await this.detachSongs(id);
    return this.playListRepo.delete(id);
  }

  paginate(options: IPaginationOptions): Promise<Pagination<Playlist>> {
    const queryBuilder = this.playListRepo.createQueryBuilder('playlist');
    queryBuilder.orderBy('playlist.name', 'ASC');
    return paginate<Playlist>(queryBuilder, options);
  }

  private async getPlaylistOrFail(id: number): Promise<Playlist> {
    const playlist = await this.playListRepo.findOne({
      where: { id },
      relations: this.playlistRelations,
    });
    if (!playlist) {
      throw new NotFoundException(`Playlist with id ${id} was not found`);
    }
    return playlist;
  }

  private async attachSongs(
    playlist: Playlist,
    songIds?: number[],
  ): Promise<void> {
    const songs = await this.loadSongs(songIds);
    if (!songs.length) {
      return;
    }

    for (const song of songs) {
      song.playList = playlist;
    }
    await this.songRepo.save(songs);
  }

  // Detach all songs from the given playlist, setting their playList to null
  private async detachSongs(playlistId: number): Promise<void> {
    const songs = await this.songRepo.findBy({ playList: { id: playlistId } });
    if (!songs.length) {
      return;
    }
    for (const song of songs) {
      song.playList = null;
    }
    await this.songRepo.save(songs);
  }

  private async loadSongs(songIds?: number[]): Promise<Song[]> {
    if (!songIds?.length) {
      return [];
    }

    return this.songRepo.findBy({ id: In(songIds) });
  }
}
