import { Injectable } from '@nestjs/common';
import { User, UserDocument, UserViewModel } from './users.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  getUser(id: string) {
    return {
      id: '1',
      login: 'login',
      email: 'email',
      createdAt: new Date().toISOString(),
    };
  }
  async createUser(user: User): Promise<UserViewModel> {
    await this.userModel.create(user);
    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
  async deleteUser(id: string) {
    return this.userModel.deleteOne({ id });
  }
}
