import { Injectable } from '@nestjs/common';
import { UserDBModel, UserViewModel } from './users.models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserModelType } from './users.schema';
import { use } from 'passport';
import { UsersModule } from './users.module';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
  ) {}

  async getUser(id: string): Promise<UserViewModel | null> {
    const user = await this.userModel.findOne({ id });
    // todo - почему Unresolved variable accountData? - без ! не работет
    if (!user) return null;
    return user;
  }

  async createUser(user: User): Promise<UserDocument | null> {
    const smartUserModel = new UserModel(user);
    await smartUserModel.save();
    return smartUserModel;

    // service
    // const user = new this.userModel();
    // create logic
    // await user.save();
    // const user = await this.userModel.createUser();
    // repo.save(user)
    // return {
    //   id: user.id,
    //   login: user.accountData.login,
    //   email: user.accountData.email,
    //   createdAt: user.accountData.createdAt.toISOString(),
    // };
  }
  async deleteUser(id: string) {
    return this.userModel.deleteOne({ id });
  }

  async saveUser(user: UserDocument) {
    await user.save();
  }
}

//service:
//repo.getUser()
//user.updateCode(UpdateUserCodeDto)
//repo.save(user)
