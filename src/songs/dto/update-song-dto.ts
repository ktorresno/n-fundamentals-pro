import {
  IsArray,
  IsDateString,
  IsMilitaryTime,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Artist } from 'src/artists/artists.entity';

export class UpdateSongDto {
  @IsString()
  @IsOptional()
  readonly title;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly artists: Artist[];

  @IsOptional()
  @IsDateString()
  readonly releasedDate: Date;

  @IsMilitaryTime()
  @IsOptional()
  readonly duration: Date;

  @IsString()
  @IsOptional()
  readonly lyrics: string;
}
