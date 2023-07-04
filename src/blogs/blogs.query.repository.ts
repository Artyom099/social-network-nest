import { Injectable } from '@nestjs/common';
import { GetItemsWithPaging, PagingViewModel } from '../utils/common.models';
import { BlogViewModel } from './blogs.models';

@Injectable()
export class BlogsQueryRepository {
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
}
