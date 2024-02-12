import { LikeStatus } from '../../../../infrastructure/utils/enums';

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
