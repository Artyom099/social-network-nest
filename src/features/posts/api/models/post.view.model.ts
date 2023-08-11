import { LikeStatus } from '../../../../infrastructure/utils/constants';

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
