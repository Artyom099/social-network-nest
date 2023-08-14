import { Injectable } from '@nestjs/common';
import { UsersPaginationInput } from '../../../infrastructure/utils/common.models';
import { User, UserDocument } from '../users.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SAUserViewModel } from '../api/models/sa.user.view.model';
import { UserViewModel } from '../api/models/user.view.model';
import { BloggerUserViewModel } from '../api/models/blogger.user.view.model';
import { PagingViewModel } from '../../../infrastructure/types/paging.view.model';
import {
  BannedUserForBlog,
  BannedUserForBlogModelType,
} from '../banned.users.for.blog.schema';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(BannedUserForBlog.name)
    private BannedUserForBlogModel: BannedUserForBlogModelType,
  ) {}
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
    const filter = { blogId };

    const totalCount = await this.BannedUserForBlogModel.countDocuments(filter);
    const sortedUsers = await this.BannedUserForBlogModel.find(filter)
      .sort(query.sortUsers())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    const items = sortedUsers.map((u) => {
      return {
        id: u.id,
        login: u.login,
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
