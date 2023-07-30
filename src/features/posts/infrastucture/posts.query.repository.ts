import { Injectable } from '@nestjs/common';
import { PagingViewModel } from '../../../infrastructure/utils/common.models';
import {
  ExtendedLikesInfoDBModel,
  NewestLikesViewModel,
  PostViewModel,
} from '../api/posts.models';
import { LikeStatus } from '../../../infrastructure/utils/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

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
    post.extendedLikesInfo.forEach((p) => {
      if (p.userId === currentUserId) myStatus = p.status;
      if (p.status === LikeStatus.Dislike) dislikesCount++;
      if (p.status === LikeStatus.Like) {
        likesCount++;
        newestLikes.push({
          addedAt: p.addedAt,
          userId: p.userId,
          login: p.login,
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
    currentUserId: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const totalCount = await this.postModel.countDocuments();
    const sortedPosts = await this.postModel
      .find()
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: NewestLikesViewModel[] = [];
      p.extendedLikesInfo.forEach((s: ExtendedLikesInfoDBModel) => {
        if (s.userId === currentUserId) myStatus = s.status;
        if (s.status === LikeStatus.Dislike) dislikesCount++;
        if (s.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: s.addedAt,
            userId: s.userId,
            login: s.login,
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
      pagesCount: Math.ceil(totalCount / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize: pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }

  async getSortedPostsCurrentBlog(
    currentUserId: string | null,
    blogId: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const filter = { blogId };
    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
    const items = sortedPosts.map((p) => {
      let myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: any[] = [];
      p.extendedLikesInfo.forEach((s: ExtendedLikesInfoDBModel) => {
        if (s.userId === currentUserId) myStatus = s.status;
        if (s.status === LikeStatus.Dislike) dislikesCount++;
        if (s.status === LikeStatus.Like) {
          likesCount++;
          newestLikes.push({
            addedAt: s.addedAt,
            userId: s.userId,
            login: s.login,
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
      pagesCount: Math.ceil(totalCount / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize: pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }
}
