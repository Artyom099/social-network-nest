import { Injectable } from '@nestjs/common';
import { CommentViewModel } from './comments.models';
import { GetItemsWithPaging, PagingViewModel } from '../utils/common.models';
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
    query: GetItemsWithPaging,
  ): Promise<PagingViewModel<CommentViewModel[]>> {
    const filter = { postId };
    const totalCount = await this.commentModel.countDocuments(filter);
    const sortedComments = await this.commentModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
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
      pagesCount: Math.ceil(totalCount / query.pageSize), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }
}
