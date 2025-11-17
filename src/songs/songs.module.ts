/**
 * Module that groups song-related functionality.
 *
 * Registers the Song and Artist TypeORM entities, exposes the SongsController
 * for handling HTTP requests related to songs, and provides the SongsService
 * for the domain/business logic and data access coordination.
 *
 * Remarks:
 * - TypeOrmModule.forFeature([Song, Artist]) makes the repositories for Song
 *   and Artist available via dependency injection within this module.
 * - SongsController is responsible for routing and request/response mapping.
 * - SongsService contains the core business logic and interacts with the
 *   repositories; alternative provider strategies (useClass, useValue) and
 *   non-class-based providers (e.g. a CONNECTION constant) are illustrated in
 *   commented code for testing or advanced configuration scenarios.
 *
 * @module SongsModule
 * @public
 */
import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from '../artists/artists.entity';
import { Song } from './songs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Song, Artist])],
  controllers: [SongsController],
  providers: [
    SongsService,
    // {
    //   provide: SongsService,
    //   useClass: SongsService,
    // },
    // {
    //   provide: SongsService,
    //   useValue: mockSongsService,
    // },
    // Non class based provider, adding constant values
    // {
    //   provide: 'CONNECTION',
    //   useValue: getConnectionFromConfig(), // This is an existing connection object
    // },
  ],
})
export class SongsModule {}
