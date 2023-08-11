import { LikeStatus } from '../../../../infrastructure/utils/constants';

export type CommentViewModel = {
  id: string;
  content: string;
  createdAt: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
};
