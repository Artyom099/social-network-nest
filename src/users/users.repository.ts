import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
  ) {}

  async getUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id });
  }
  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
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

  async createUser(userDTO: any) {
    return User.createUserClass(userDTO, this.userModel);
  }
  async save(model: any) {
    return model.save();
  }

  async updateUser(id: string, user: User) {
    return this.userModel.updateOne({ id }, { user });
  }

  async deleteUser(id: string) {
    await this.userModel.deleteOne({ id });
  }
}
