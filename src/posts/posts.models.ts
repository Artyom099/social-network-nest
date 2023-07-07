import { LikeStatus } from '../utils/constants';
import { IsNotEmpty, Length } from 'class-validator';

export class PostInputModel {
  @IsNotEmpty()
  @Length(3, 30)
  title: string;
  @IsNotEmpty()
  @Length(3, 100)
  shortDescription: string;
  @IsNotEmpty()
  @Length(3, 1000)
  content: string;
  @IsNotEmpty()
  blogId: string;
}

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
