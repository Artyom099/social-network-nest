import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LikeStatus } from '../../../../infrastructure/utils/constants';

export class LikeStatusInputModel {
  @IsString()
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
