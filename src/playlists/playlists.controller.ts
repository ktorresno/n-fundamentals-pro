import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  HttpException,
  HttpStatus,
  DefaultValuePipe,
  Query,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { Playlist } from './playlist.entity';
import { CreatePlayListDto } from './dto/create-playlist-dto';
import { UpdatePlayListDto } from './dto/update-playlist-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { DeleteResult } from 'typeorm';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistService: PlaylistsService) {}

  @Post()
  async create(@Body() playload: CreatePlayListDto): Promise<Playlist> {
    try {
      return await this.playlistService.create(playload);
    } catch (err) {
      throw new HttpException(
        'Error mientras se creaba el registro para la Playlist',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: err },
      );
    }
  }

  @Get()
  @Get('all')
  findAll(
    @Query('page', new DefaultValuePipe(undefined)) page?: string,
    @Query('limit', new DefaultValuePipe(undefined)) limit?: string,
  ): Promise<Playlist[] | Pagination<Playlist>> {
    try {
      const isPaginated = page !== undefined || limit !== undefined;
      if (!isPaginated) return this.playlistService.findAll();

      const p = Number(page);
      const l = Math.min(Number(limit), 100);
      return this.playlistService.paginate({ page: p, limit: l });
    } catch (error) {
      console.error('Error fetching all playlists:', error);
      throw new HttpException(
        'Error al buscar todos los elementos.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    try {
      return await this.playlistService.findOne(id);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw new HttpException(
        `Error mientras se buscaba el registro de 'Playlist' con ID: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  @Put(':id')
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() payload: UpdatePlayListDto,
  ): Promise<Playlist> {
    try {
      return await this.playlistService.update(id, payload);
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw new HttpException(
        `Error mientras se actualizaba el registro de 'Playlist' con ID: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<DeleteResult> {
    try {
      return await this.playlistService.remove(id);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw new HttpException(
        `Error mientras se eliminaba el registro de 'Playlist' con ID: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }
}
