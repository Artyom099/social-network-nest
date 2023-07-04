import { Injectable } from '@nestjs/common';
import { GetItemsWithPaging, PagingViewModel } from '../utils/common.models';
import { PostViewModel } from './posts.models';
import { LikeStatus } from '../utils/constants';

@Injectable()
export class PostsQueryRepository {
  async getSortedPosts(
    query: GetItemsWithPaging,
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const totalCount = 1;
    const sortedPosts = [
      {
        id: 'string',
        title: 'string',
        shortDescription: 'string',
        content: 'string',
        blogId: 'string',
        blogName: 'string',
        createdAt: 'string',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      },
    ];
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items: sortedPosts,
    };
  }

  async getSortedPostsCurrentBlog(
    blogId,
    query,
  ): Promise<PagingViewModel<PostViewModel[]>> {
    const totalCount = 1;
    const sortedPosts = [
      {
        id: 'string',
        title: 'string',
        shortDescription: 'string',
        content: 'string',
        blogId,
        blogName: 'string',
        createdAt: 'string',
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      },
    ];
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items: sortedPosts,
    };
  }
}
