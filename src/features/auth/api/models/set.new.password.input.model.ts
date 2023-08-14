import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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
