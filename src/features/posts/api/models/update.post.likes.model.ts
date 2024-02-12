import { LikeStatus } from '../../../../infrastructure/utils/enums';

export type UpdatePostLikesModel = {
  postId: string;
  userId: string;
  newLikeStatus: LikeStatus;
  addedAt: Date;
  login: string;
};
