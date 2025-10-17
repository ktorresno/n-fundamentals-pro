import { Injectable, Scope } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song-dto';
//import { getConnectionFromConfig } from '../common/constants/connection';

@Injectable({
  scope: Scope.TRANSIENT, // Default scope, a single instance is shared across the application.
})
export class SongsService {
  // constructor(
  //   @Inject('CONNECTION')
  //   connection: getConnectionFromConfig,
  // ) {
  //   console.log('Connection Service Injected:', connection);
  // }
  private readonly songs: string[] = [];

  create(songDto: CreateSongDto): string[] {
    this.songs.push(JSON.stringify(songDto));
    return this.songs;
  }

  findAll(): string[] {
    return this.songs;
  }

  findOne(id: number): string {
    return this.songs[id];
  }

  update(id: number, song: string): void {
    this.songs[id] = song;
  }

  remove(id: number): void {
    this.songs.splice(id, 1);
  }
}
