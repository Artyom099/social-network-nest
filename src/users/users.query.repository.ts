import { Injectable } from '@nestjs/common';
import { PagingViewModel } from '../utils/common.models';
import { UserViewModel } from './users.models';

@Injectable()
export class UsersQueryRepository {
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
}
