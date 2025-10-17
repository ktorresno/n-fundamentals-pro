import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Song } from './songs.entity';

// const mockSongsService = {
//   findAll() {
//     return [
//       {
//         id: 1,
//         title: 'Lasting lover',
//       },
//     ];
//   },
// };
@Module({
  imports: [TypeOrmModule.forFeature([Song])],
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
