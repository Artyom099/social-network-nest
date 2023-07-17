import { LikeStatus } from '../utils/constants';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommentInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300)
  @Transform(({ value }) => value?.trim())
  content: string;
}

export type CommentDBModel = {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    userId: string;
    status: LikeStatus;
  }[];
};
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
