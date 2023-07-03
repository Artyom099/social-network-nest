import { LikeStatus } from '../utils/constants';

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
