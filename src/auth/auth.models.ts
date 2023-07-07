import { IsNotEmpty, IsString } from 'class-validator';

export class AuthInputModel {
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}
