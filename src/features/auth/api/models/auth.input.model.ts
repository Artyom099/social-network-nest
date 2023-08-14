import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class AuthInputModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  loginOrEmail: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  password: string;
}
