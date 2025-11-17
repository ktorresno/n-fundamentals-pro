import {
  Controller,
  Get,
  Delete,
  Post,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Body,
  Query,
  DefaultValuePipe,
  Put,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song-dto';
import { Song } from './songs.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateSongDto } from './dto/update-song-dto';
/**
 * Scope.REQUEST: A new instance of the controller is created for each request.
 * This is useful when you need to maintain state or data specific to a single request.
 * However, it can lead to increased memory usage and reduced performance due to the overhead of creating new instances.
 *
 * Using path in the @Controller decorator allows you to define a base route for all the endpoints in that controller.
 */
/*@Controller({
  path: 'songs',
  scope: Scope.DEFAULT,
})*/
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  async create(@Body() createSongDto: CreateSongDto): Promise<Song> {
    try {
      return await this.songsService.create(createSongDto);
    } catch (error) {
      throw new HttpException(
        'Error mientras se creaba el registro de Song.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  /**
   * Retrieves a paginated list of songs.
   *
   * Applies default values for query parameters and enforces a maximum page size:
   * - page defaults to 1 (via DefaultValuePipe)
   * - limit defaults to 10 (via DefaultValuePipe) and is capped at 100
   *
   * Delegates the actual retrieval to this.songsService.paginate({ page, limit }).
   * Any error thrown by the service is logged to console and rethrown as an HttpException
   * with status INTERNAL_SERVER_ERROR and message 'Error al buscar todos los elementos.',
   * preserving the original error as the cause.
   *
   * @param page - Page number to retrieve (default: 1).
   * @param limit - Number of items per page (default: 10, maximum: 100).
   * @returns Promise<Pagination<Song>> A promise that resolves to a paginated list of Song entities.
   * @throws {HttpException} When an error occurs while fetching songs; status is INTERNAL_SERVER_ERROR and the original error is attached as the cause.
   */
  @Get()
  @Get('all')
  async findAll(
    @Query('page', new DefaultValuePipe(undefined)) page?: string,
    @Query('limit', new DefaultValuePipe(undefined)) limit?: string,
  ): Promise<Song[] | Pagination<Song>> {
    try {
      const isPaginated = page !== undefined || limit !== undefined;
      if (!isPaginated) return await this.songsService.findAll();

      const p = Number(page);
      const l = Math.min(Number(limit), 100);
      return await this.songsService.paginate({ page: p, limit: l });
    } catch (error) {
      console.error('Error fetching all songs:', error);
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
      return await this.songsService.findOne(id);
    } catch (error) {
      console.error('Error fetching song:', error);
      throw new HttpException(
        `Error mientras se buscaba el registro con ID: ${id}`,
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
    @Body() updateSongDto: UpdateSongDto,
  ): Promise<UpdateResult> {
    try {
      return await this.songsService.update(id, updateSongDto);
    } catch (error) {
      throw new HttpException(
        `Error mientras se actualizaba el registro con ID: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  @Delete(':id')
  async delete(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<DeleteResult> {
    try {
      return await this.songsService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Error mientras se eliminaba el registro con ID: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }
}
