import { LikeStatus } from '../../../../infrastructure/utils/constants';
import {
  IsNotEmpty,
  IsString,
  Length,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ name: 'BlogExists', async: true })
export class BlogExistsConstraint implements ValidatorConstraintInterface {
  constructor(private blogsQueryRepo: BlogsQueryRepository) {}
  async validate(id: string) {
    const blog = await this.blogsQueryRepo.getBlog(id);
    return !!blog;
  }
  defaultMessage() {
    return "Blog with this id doesn't exist";
  }
}

export class PostInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  @Transform(({ value }) => value?.trim())
  title: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @Transform(({ value }) => value?.trim())
  shortDescription: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 1000)
  @Transform(({ value }) => value?.trim())
  content: string;
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