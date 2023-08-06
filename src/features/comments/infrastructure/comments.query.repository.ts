import { Injectable } from '@nestjs/common';
import { CommentViewModel } from '../api/comments.models';
import { PagingViewModel } from '../../../infrastructure/utils/common.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments.schema';
import { LikeStatus } from '../../../infrastructure/utils/constants';
import { User, UserDocument } from '../../users/users.schema';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();
    const idBannedUsers = bannedUsers.map((u) => u.id);

    comment.likesInfo.forEach((l) => {
      if (l.userId === currentUserId) myStatus = l.status;
      if (idBannedUsers.includes(l.userId)) return;
      if (l.status === LikeStatus.Like) likesCount++;
      if (l.status === LikeStatus.Dislike) dislikesCount++;
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
    // todo исключить комменты забаненых пользователей - начать с этого
    // , $nor: [{ 'banInfo.isBanned': true }]
    //затем исключаем , $nor: [{ 'commentatorInfo.userId': userId }]
    const filter = { postId };
    const totalCount = await this.commentModel.countDocuments(filter);
    const sortedComments = await this.commentModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();
    const idBannedUsers = bannedUsers.map((u) => u.id);

    const items = sortedComments.map((c) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      c.likesInfo.forEach((l) => {
        if (l.userId === currentUserId) myStatus = l.status;
        if (idBannedUsers.includes(l.userId)) return;
        if (l.status === LikeStatus.Like) likesCount++;
        if (l.status === LikeStatus.Dislike) dislikesCount++;
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
