import { Injectable } from '@nestjs/common';
import { DefaultPaginationInput } from '../../../infrastructure/models/pagination.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../comments.schema';
import { LikeStatus } from '../../../infrastructure/utils/enums';
import { User, UserDocument } from '../../users/schemas/users.schema';
import { Blog, BlogDocument } from '../../blogs/blogs.schema';
import { CommentViewModel } from '../api/models/comment.view.model';
import { PagingViewModel } from '../../../infrastructure/models/paging.view.model';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
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

    return this.mapToView(comment, likesCount, dislikesCount, myStatus);
  }

  async getCommentsCurrentPost(
    currentUserId: string | null,
    postId: string,
    query: DefaultPaginationInput,
  ): Promise<PagingViewModel<CommentViewModel[]>> {
    const filter = { postId };

    const totalCount = await this.commentModel.countDocuments(filter);

    const sortedComments = await this.commentModel
      .find(filter)
      .sort(query.sort())
      .skip(query.skip())
      .limit(query.pageSize)
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

      return this.mapToView(c, likesCount, dislikesCount, myStatus);
    });

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество комментов на странице
      totalCount, // общее количество комментов
      items,
    };
  }

  async getCommentsCurrentBlogger(
    currentUserId: string,
    query: DefaultPaginationInput,
  ): Promise<PagingViewModel<CommentViewModel[]>> {
    const blogFilter = { 'blogOwnerInfo.userId': currentUserId };

    const sortedBlogs = await this.blogModel.find(blogFilter).lean().exec();

    const blogsId = sortedBlogs.map((b) => b.id);

    const totalCount = await this.commentModel.countDocuments();

    const sortedComments = await this.commentModel
      .find()
      .sort(query.sort())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();

    const idBannedUsers = bannedUsers.map((u) => u.id);

    const items = sortedComments
      .filter((c) => blogsId.includes(c.postInfo.blogId))
      .map((c) => {
        let myStatus = LikeStatus.None;
        let likesCount = 0;
        let dislikesCount = 0;

        c.likesInfo.forEach((l) => {
          if (l.userId === currentUserId) myStatus = l.status;
          if (idBannedUsers.includes(l.userId)) return;
          if (l.status === LikeStatus.Like) likesCount++;
          if (l.status === LikeStatus.Dislike) dislikesCount++;
        });

        return this.mapToView(c, likesCount, dislikesCount, myStatus);
      });

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество комментов на странице
      totalCount, // общее количество комментов
      items,
    };
  }

  mapToView(
    comment: Comment,
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
  ): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
      },
      postInfo: {
        id: comment.postInfo.id,
        title: comment.postInfo.title,
        blogId: comment.postInfo.blogId,
        blogName: comment.postInfo.blogName,
      },
    };
  }
}
