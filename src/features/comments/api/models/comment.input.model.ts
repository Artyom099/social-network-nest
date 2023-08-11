import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommentInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  @Transform(({ value }) => value?.trim())
  content: string;
}
