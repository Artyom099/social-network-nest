import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class PostInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  @Transform(({ value }) => value?.trim())
  title: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @Transform(({ value }) => value?.trim())
  shortDescription: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 1000)
  @Transform(({ value }) => value?.trim())
  content: string;
}
