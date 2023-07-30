import { Injectable } from '@nestjs/common';
import { CommentViewModel } from '../api/comments.models';
import { PagingViewModel } from '../../../infrastructure/utils/common.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments.schema';
import { LikeStatus } from '../../../infrastructure/utils/constants';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getComment(
    id: string,
    currentUserId?: string | null,
  ): Promise<CommentViewModel | null> {
    const comment = await this.commentModel.findOne({ id }).exec();
    if (!comment) return null;
    let myStatus = LikeStatus.None;
    let likesCount = 0;
    let dislikesCount = 0;
    comment.likesInfo.forEach((s) => {
      if (s.userId === currentUserId) myStatus = s.status;
      if (s.status === LikeStatus.Like) likesCount++;
      if (s.status === LikeStatus.Dislike) dislikesCount++;
    });
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
      },
    };
  }

  async getCommentsCurrentPost(
    currentUserId: string | null,
    postId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<PagingViewModel<CommentViewModel[]>> {
    const filter = { postId };
    const totalCount = await this.commentModel.countDocuments(filter);
    const sortedComments = await this.commentModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
    const items = sortedComments.map((c) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      c.likesInfo.forEach((s) => {
        if (s.userId === currentUserId) myStatus = s.status;
        if (s.status === LikeStatus.Like) likesCount++;
        if (s.status === LikeStatus.Dislike) dislikesCount++;
      });
      return {
        id: c.id,
        content: c.content,
        commentatorInfo: {
          userId: c.commentatorInfo.userId,
          userLogin: c.commentatorInfo.userLogin,
        },
        createdAt: c.createdAt,
        likesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
        },
      };
    });
    return {
      pagesCount: Math.ceil(totalCount / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize: pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }
}
