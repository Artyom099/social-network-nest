import { Injectable } from '@nestjs/common';
import { CommentViewModel } from './comments.models';
import { PagingViewModel } from '../utils/common.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments.schema';
import { LikeStatus } from '../utils/constants';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getCommentsCurrentPost(
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
      const myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      // todo - как узнать currentUserId без мидлвейр?
      c.likesInfo.forEach((s) => {
        // if (s.userId === currentUserId) myStatus = s.status;
        if (s.status === LikeStatus.Like) likesCount++;
        if (s.status === LikeStatus.Dislike) dislikesCount++;
      });
      return {
        id: c.id,
        content: c.content,
        commentatorIno: {
          userId: c.commentatorIno.userId,
          userLogin: c.commentatorIno.userLogin,
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
