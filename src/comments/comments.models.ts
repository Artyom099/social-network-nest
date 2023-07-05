import { LikeStatus } from '../utils/constants';

export type CommentDBModel = {
  id: string;
  postId: string;
  content: string;
  commentatorIno: {
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
  commentatorIno: {
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
