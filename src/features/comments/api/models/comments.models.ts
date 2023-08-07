import { LikeStatus } from '../../../../infrastructure/utils/constants';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommentInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  @Transform(({ value }) => value?.trim())
  content: string;
}

export class LikeStatusInputModel {
  @IsString()
  @IsNotEmpty()
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}

export type CommentViewModel = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
};

export type CreateCommentModel = {
  postId: string;
  content: string;
  userId: string;
  userLogin: string;
};
