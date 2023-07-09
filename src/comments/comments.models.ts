import { LikeStatus } from '../utils/constants';
import { IsNotEmpty, Length } from 'class-validator';

export class CommentInputModel {
  @IsNotEmpty()
  @Length(20, 300)
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
