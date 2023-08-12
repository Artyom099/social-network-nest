import { Injectable } from '@nestjs/common';
import { UsersPaginationInput } from '../../../infrastructure/utils/common.models';
import { User, UserDocument } from '../users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SAUserViewModel } from '../api/models/sa.user.view.model';
import { UserViewModel } from '../api/models/user.view.model';
import { BloggerUserViewModel } from '../api/models/blogger.user.view.model';
import { PagingViewModel } from '../../../infrastructure/types/paging.view.model';

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

  // blogger methods
  async getBannedUsersCurrentBlog(
    blogId: string,
    query: UsersPaginationInput,
  ): Promise<PagingViewModel<BloggerUserViewModel[]>> {
    // todo - blogId должен быть в массиве blogsWhereBanned
    const filter = {};

    //забаненый юзер хочет написать коммент для блога, в котором он забанен
    //1. лезем в блог, чтобы достать масси забаненых юзеров
    //2. лезем в юзера, чтобы достать массив блогов, где он забанен
    //3. лезем в отдельную коллекцию
    // в юзера мы уже и так лезем, значит будем хранить массив blogId в юзере

    //у каждого блога есть забаненые юзеры - варианты хранения:
    //1. массив забаненных userId в сущности блога
    //2. массив blogId, где забанен юзер в сущности юзера
    // + 3. коллекция: ключ - блог, значение - массив забаненых юзеров

    const totalCount = await this.userModel.countDocuments(filter);
    const sortedUsers = await this.userModel
      .find(filter)
      .sort(query.sortUsers())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.accountData.login,
        banInfo: {
          isBanned: u.banInfo.isBanned,
          banDate: u.banInfo.banDate ? u.banInfo.banDate.toISOString() : null,
          banReason: u.banInfo.banReason,
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

  // SA methods
  async getUserById(id: string): Promise<UserViewModel | null> {
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      return null;
    } else {
      return this.getViewModel(user);
    }
  }
  async getSortedUsersToSA(
    query: UsersPaginationInput,
  ): Promise<PagingViewModel<SAUserViewModel[]>> {
    const filter = {
      $or: [
        {
          'accountData.login': {
            $regex: query.searchLoginTerm ?? '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: query.searchEmailTerm ?? '',
            $options: 'i',
          },
        },
      ],
    };

    if (typeof query.banStatus === 'boolean')
      filter['banInfo.isBanned'] = query.banStatus;

    const totalCount = await this.userModel.countDocuments(filter);
    const sortedUsers = await this.userModel
      .find(filter)
      .sort(query.sortUsers())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.accountData.login,
        email: u.accountData.email,
        createdAt: u.accountData.createdAt.toISOString(),
        banInfo: {
          isBanned: u.banInfo.isBanned,
          banDate: u.banInfo.banDate ? u.banInfo.banDate.toISOString() : null,
          banReason: u.banInfo.banReason,
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
