import { Injectable } from '@nestjs/common';
import { PagingViewModel } from '../../../infrastructure/utils/common.models';
import { SAUserViewModel, UserViewModel } from '../api/users.models';
import { User, UserDocument } from '../users.schema';
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
    const user = await this.userModel.findOne({ id }).exec();
    if (!user) {
      return null;
    } else {
      return this.getViewModel(user);
    }
  }

  // todo перенести в обычный репо
  async getUserById2(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id });
  }
  async getUserByLoginOrEmail(logOrMail: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { 'accountData.email': logOrMail },
        { 'accountData.login': logOrMail },
      ],
    });
  }
  async getUserByRecoveryCode(code: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ recoveryCode: code });
  }
  async getUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
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

  async getSortedUsersToSA(
    loginTerm: string | null,
    emailTerm: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    banStatus: boolean | null,
  ): Promise<PagingViewModel<SAUserViewModel[]>> {
    const filter = {
      $or: [
        {
          'accountData.login': { $regex: loginTerm ?? '', $options: 'i' },
        },
        {
          'accountData.email': { $regex: emailTerm ?? '', $options: 'i' },
        },
      ],
    };
    if (banStatus !== null) filter['banInfo.isBanned'] = banStatus;
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
        banInfo: {
          isBanned: u.banInfo.isBanned,
          banDate: u.banInfo.banDate ? u.banInfo.banDate.toISOString() : null,
          banReason: u.banInfo.banReason,
        },
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
