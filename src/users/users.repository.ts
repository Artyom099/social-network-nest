import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './users.schema';
import { CreateUserInputModel } from './users.models';

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
        { 'accountData.email': loginOrEmail },
        { 'accountData.login': loginOrEmail },
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

  async createUser(
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
  ) {
    return User.createUserClass(
      InputModel,
      passwordSalt,
      passwordHash,
      this.userModel,
    );
  }
  async createUserBySelf(
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
  ) {
    return User.createUserBySelf(
      InputModel,
      passwordSalt,
      passwordHash,
      this.userModel,
    );
  }

  async save(model: any) {
    return model.save();
  }
  //todo - этот метод вроде не работает
  async updateUser(id: string, user: User) {
    return this.userModel.updateOne({ id }, { user });
  }
  async deleteUser(id: string) {
    await this.userModel.deleteOne({ id });
  }
}
