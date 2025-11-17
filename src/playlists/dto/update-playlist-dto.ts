import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePlayListDto {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  readonly songs: number[];

  @IsNumber()
  @IsOptional()
  readonly user: number;
}
