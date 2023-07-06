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
  extendedLikesInfo: ExtendedLikesInfoViewModel;
};
export type ExtendedLikesInfoViewModel = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikesViewModel[];
};
export type NewestLikesViewModel = {
  addedAt: string;
  userId: string;
  login: string;
};

export type PostDBModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoDBModel[];
};
export type ExtendedLikesInfoDBModel = {
  userId: string;
  login: string;
  addedAt: string;
  status: LikeStatus;
};
export type PostCreateDTO = Omit<PostDBModel, 'id'>;
