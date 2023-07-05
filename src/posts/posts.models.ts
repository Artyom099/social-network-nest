import { LikeStatus } from '../utils/constants';

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};
export type PostViewModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
    newestLikes: {
      addedAt: string;
      userId: string;
      login: string;
    }[];
  };
};
export type PostDBModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    userId: string;
    login: string;
    addedAt: string;
    status: LikeStatus;
  }[];
};
