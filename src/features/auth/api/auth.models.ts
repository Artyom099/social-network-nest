import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
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
export class EmailInputModel {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  email: string;
}
export class SetNewPasswordInputModel {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  recoveryCode: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  newPassword: string;
}

export type TokenPayloadType = {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
};
