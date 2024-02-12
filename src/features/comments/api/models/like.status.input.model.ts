import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeStatus } from '../../../../infrastructure/utils/enums';

export class LikeStatusInputModel {
  @IsString()
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
