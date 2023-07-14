import { Injectable } from '@nestjs/common';
import { PagingViewModel } from '../utils/common.models';
import { UserViewModel } from './users.models';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  getViewModel(user): UserViewModel {
    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }

  async getUserById(id: string): Promise<UserViewModel | null> {
    //достали тупого юзера
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) return null;
    // вернули ViewModel умного юзера
    return this.getViewModel(user);
  }

  async getSortedUsers(
    searchEmailTerm: string | null,
    searchLoginTerm: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<PagingViewModel<UserViewModel[]>> {
    const filter = {
      $or: [
        {
          'accountData.login': { $regex: searchLoginTerm ?? '', $options: 'i' },
        },
        {
          'accountData.email': { $regex: searchEmailTerm ?? '', $options: 'i' },
        },
      ],
    };
    const _sortBy = 'accountData.' + sortBy;
    const totalCount = await this.userModel.countDocuments(filter);
    const sortedUsers = await this.userModel
      .find(filter)
      .sort({ [_sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.accountData.login,
        email: u.accountData.email,
        createdAt: u.accountData.createdAt.toISOString(),
      };
    });
    return {
      pagesCount: Math.ceil(totalCount / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }
}
