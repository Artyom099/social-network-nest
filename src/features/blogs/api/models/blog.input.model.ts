import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class BlogInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(3, 15)
  @Transform(({ value }) => value?.trim())
  name: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  @Transform(({ value }) => value?.trim())
  description: string;
  @IsUrl()
  @IsNotEmpty()
  @Length(3, 100)
  @Transform(({ value }) => value?.trim())
  websiteUrl: string;
}
