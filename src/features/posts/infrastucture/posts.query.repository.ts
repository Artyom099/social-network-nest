import { Injectable } from '@nestjs/common';
import { DefaultPaginationInput } from '../../../infrastructure/utils/common.models';
import { LikeStatus } from '../../../infrastructure/utils/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../users/schemas/users.schema';
import {
  NewestLikesViewModel,
  PostViewModel,
} from '../api/models/post.view.model';
import { ExtendedLikesInfoDBModel } from '../api/models/post.db.model';
import { PagingViewModel } from '../../../infrastructure/types/paging.view.model';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getPost(
    id: string,
    currentUserId?: string | null,
  ): Promise<PostViewModel | null> {
    const post = await this.postModel.findOne({ id }).exec();

    if (!post) return null;
    let myStatus = LikeStatus.None;
    let likesCount = 0;
    let dislikesCount = 0;
    const newestLikes: NewestLikesViewModel[] = [];

    const bannedUsers = await this.userModel
      .find({ 'banInfo.isBanned': true })
      .lean()
      .exec();
    const idBannedUsers = bannedUsers.map((u) => u.id);

    post.extendedLikesInfo.forEach((l) => {
      if (l.userId === currentUserId) myStatus = l.status;
      if (idBannedUsers.includes(l.userId)) return;
      if (l.status === LikeStatus.Dislike) dislikesCount++;
      if (l.status === LikeStatus.Like) {
        likesCount++;
        newestLikes.push({
          addedAt: l.addedAt,
          userId: l.userId,
          login: l.login,
        });
      }
    });
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: newestLikes
          .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
          .slice(-3)
          .reverse(),
      },
    };
  }

  async getSortedPosts(
    currentUserId: string,
    query: DefaultPaginationInput,
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const filter = { 'banInfo.isBanned': false };

    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
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

    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: NewestLikesViewModel[] = [];
      p.extendedLikesInfo.forEach((l: ExtendedLikesInfoDBModel) => {
        if (l.userId === currentUserId) myStatus = l.status;
        if (idBannedUsers.includes(l.userId)) return;
        if (l.status === LikeStatus.Dislike) dislikesCount++;
        if (l.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.login,
          });
        }
      });
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
          newestLikes: newestLikes
            .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
            .slice(-3)
            .reverse(),
        },
      };
    });
    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }

  async getSortedPostsCurrentBlog(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const filter = { blogId, 'banInfo.isBanned': true };

    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
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

    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: any[] = [];
      p.extendedLikesInfo.forEach((l: ExtendedLikesInfoDBModel) => {
        if (l.userId === currentUserId) myStatus = l.status;
        if (idBannedUsers.includes(l.userId)) return;
        if (l.status === LikeStatus.Dislike) dislikesCount++;
        if (l.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.login,
          });
        }
      });
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
          newestLikes: newestLikes
            .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
            .slice(-3)
            .reverse(),
        },
      };
    });

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }

  async getSortedPostsCurrentBlogForBlogger(
    currentUserId: string | null,
    blogId: string,
    query: DefaultPaginationInput,
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const filter = { blogId };

    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
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

    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: any[] = [];
      p.extendedLikesInfo.forEach((l: ExtendedLikesInfoDBModel) => {
        if (l.userId === currentUserId) myStatus = l.status;
        if (idBannedUsers.includes(l.userId)) return;
        if (l.status === LikeStatus.Dislike) dislikesCount++;
        if (l.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: l.addedAt,
            userId: l.userId,
            login: l.login,
          });
        }
      });
      return {
        id: p.id,
        title: p.title,
        shortDescription: p.shortDescription,
        content: p.content,
        blogId: p.blogId,
        blogName: p.blogName,
        createdAt: p.createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus,
          newestLikes: newestLikes
            .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
            .slice(-3)
            .reverse(),
        },
      };
    });

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }
}
