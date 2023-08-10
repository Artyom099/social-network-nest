import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  @Transform(({ value }) => value?.trim())
  login: string;
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  email: string;
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  @Transform(({ value }) => value?.trim())
  password: string;
}
