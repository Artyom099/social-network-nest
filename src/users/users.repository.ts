import { Injectable } from '@nestjs/common';
import { UserViewModel } from './users.models';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModel } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id });
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.userModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  // async createUser(userDTO: User): Promise<UserDocument | null> {
  //   //создаем умный объект из DTO
  //   const smartUserModel = new UserModel(userDTO);
  //   await smartUserModel.save();
  //   return smartUserModel;
  //
  //   // service
  //   // const user = new this.userModel();
  //   // create logic
  //   // await user.save();
  //   // const user = await this.userModel.createUser();
  //   // repo.save(user)
  // }
  async deleteUser(id: string) {
    await this.userModel.deleteOne({ id });
    const u = await this.userModel.findOne();
    u.s;
  }

  async createUser(user: User) {
    return this.userModel.create(user);
  }

  async updateUser(id: string, user: User) {
    return this.userModel.updateOne({ id }, { user });
  }
}

//service:
//repo.getUser()
//user.updateCode(UpdateUserCodeDto)
//repo.save(user)
