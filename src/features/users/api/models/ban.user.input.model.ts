import { IsBoolean, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class BanUserInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
  @IsString()
  @Length(20)
  @Transform(({ value }) => value?.trim())
  banReason: string;
}
