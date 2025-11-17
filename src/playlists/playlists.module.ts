import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from '../songs/songs.entity';
import { User } from '../users/users.entity';
import { Playlist } from './playlist.entity';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, Song, User])],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
})
export class PlaylistsModule {}
