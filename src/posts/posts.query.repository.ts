import { Injectable } from '@nestjs/common';
import { GetItemsWithPaging, PagingViewModel } from '../utils/common.models';
import {
  extendedLikesInfoDBModel,
  NewestLikes,
  PostViewModel,
} from './posts.models';
import { LikeStatus } from '../utils/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getSortedPosts(
    query: GetItemsWithPaging,
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const totalCount = await this.postModel.countDocuments();
    const sortedPosts = await this.postModel
      .find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean()
      .exec();
    const items = sortedPosts.map((p) => {
      const myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes = [];
      // todo - как узнать currentUserId без мидлвейр?
      p.extendedLikesInfo.forEach((s) => {
        // if (s.userId === currentUserId) myStatus = s.status;
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
            .sort((a, b) => a.addedAt - b.addedAt)
            .slice(-3)
            .reverse(),
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

  async getSortedPostsCurrentBlog(
    blogId,
    query,
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const filter = { blogId };
    const totalCount = await this.postModel.countDocuments(filter);
    const sortedPosts = await this.postModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean()
      .exec();
    const items = sortedPosts.map((p) => {
      const myStatus = LikeStatus.None;
      let likesCount = 0;
      let dislikesCount = 0;
      const newestLikes: any[] = [];
      // todo - как узнать currentUserId без мидлвейр?
      p.extendedLikesInfo.forEach((s: extendedLikesInfoDBModel) => {
        // if (s.userId === currentUserId) myStatus = s.status;
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
      pagesCount: Math.ceil(totalCount / query.pageSize), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }
}
