import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Body,
  Scope,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song-dto';
/**
 * Scope.REQUEST: A new instance of the controller is created for each request.
 * This is useful when you need to maintain state or data specific to a single request.
 * However, it can lead to increased memory usage and reduced performance due to the overhead of creating new instances.
 *
 * Using path in the @Controller decorator allows you to define a base route for all the endpoints in that controller.
 */
@Controller({
  path: 'songs',
  scope: Scope.DEFAULT,
})
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  create(@Body() createSongDto: CreateSongDto): string[] {
    const result = this.songsService.create(createSongDto);
    return result;
  }

  @Get()
  findAll() {
    try {
      return this.songsService.findAll();
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw new HttpException(
        'Error al buscar todos los elementos.',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    try {
      return this.songsService.findOne(id);
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
  update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): void {
    try {
      return this.songsService.update(id, `Updated Song #${id}`);
    } catch (error) {
      throw new HttpException(
        `Error mientras se actualizaba el registro con ID: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }

  @Delete(':id')
  remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): void {
    try {
      return this.songsService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Error mientras se eliminaba el registro con ID: ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    }
  }
}
