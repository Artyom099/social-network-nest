import { Injectable } from '@nestjs/common';
import { PagingViewModel, UserViewModel } from '../users/users.models';
import { BlogViewModel } from '../blogs/blogs.models';
import { PostViewModel } from '../posts/posts.models';

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
    const totalCount = 0;
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

  async getSortedBlogs(): Promise<PagingViewModel<BlogViewModel[]>> {}

  async getSortedPosts(query) {}

  async getSortedPostsCurrentBlog(): Promise<
    PagingViewModel<PostViewModel[]>
  > {}

  async getSortedCommentsCurrentPost(postId) {}
}
