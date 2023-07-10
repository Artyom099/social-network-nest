import { Injectable } from '@nestjs/common';
import { UserDBModel, UserViewModel } from './users.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUser(id: string): Promise<UserViewModel | null> {
    const user = await this.userModel.findOne({ id });
    // todo - почему Unresolved variable accountData? - без ! не работет
    return {
      id: user!.id,
      login: user!.accountData.login,
      email: user!.accountData.email,
      createdAt: user!.accountData.createdAt.toISOString(),
    };
  }
  async createUser(user: UserDBModel): Promise<UserViewModel> {
    await this.userModel.create(user);
    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt.toISOString(),
    };
  }
  async deleteUser(id: string) {
    return this.userModel.deleteOne({ id });
  }
}
