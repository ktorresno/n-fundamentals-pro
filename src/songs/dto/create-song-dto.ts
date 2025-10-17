import {
  IsArray,
  IsDateString,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSongDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  readonly artists: string[];

  @IsNotEmpty()
  @IsDateString()
  readonly releasedDate: string;

  @IsNotEmpty()
  @IsMilitaryTime()
  readonly duration: string;

  @IsString()
  @IsOptional()
  readonly lyrics: string;
}
