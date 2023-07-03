import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../users/users.models';
import { BlogViewModel } from '../blogs/blogs.models';
import { PostViewModel } from '../posts/posts.models';
import { CommentViewModel } from '../comments/comments.models';
import { GetItemsWithPaging, PagingViewModel } from '../utils/common.models';
import { LikeStatus } from '../utils/constants';

@Injectable()
export class QueryRepository {
  async getSortedUsers(
    searchEmailTerm: string | null,
    searchLoginTerm: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<PagingViewModel<UserViewModel[]>> {
    const totalCount = 1;
    const sortedUsers = [
      {
        id: '',
        login: 'string',
        email: 'string',
        createdAt: 'string',
      },
    ];
    return {
      pagesCount: Math.ceil(totalCount / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items: sortedUsers,
    };
  }

  async getSortedBlogs(
    query: GetItemsWithPaging,
  ): Promise<PagingViewModel<BlogViewModel[]>> {
    const totalCount = 1;
    const sortedBlogs = [
      {
        id: 'string',
        name: 'string',
        description: 'string',
        websiteUrl: 'string',
        createdAt: 'string',
        isMembership: true,
      },
    ];
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items: sortedBlogs,
    };
  }

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

  async getCommentsCurrentPost(
    postId: string,
  ): Promise<PagingViewModel<CommentViewModel[]>> {}
}
