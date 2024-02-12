import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../schemas/users.schema';
import { CreateUserInputModel } from '../api/models/create.user.input.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

  async createUserByAdmin(
    dto: CreateUserInputModel,
    salt: string,
    hash: string,
  ) {
    return User.createUserByAdmin(dto, salt, hash, this.userModel);
  }

  async createUserBySelf(
    dto: CreateUserInputModel,
    salt: string,
    hash: string,
  ) {
    return User.createUserBySelf(dto, salt, hash, this.userModel);
  }

  async save(model: any) {
    return model.save();
  }

  async deleteUser(id: string) {
    await this.userModel.deleteOne({ id });
  }

  async getUserDocumentById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id });
  }

  async getUserDocumentByLoginOrEmail(
    logOrMail: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [
        { 'accountData.email': logOrMail },
        { 'accountData.login': logOrMail },
      ],
    });
  }

  async getUserDocumentByRecoveryCode(
    code: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({ recoveryCode: code });
  }

  async getUserDocumentByConfirmationCode(
    code: string,
  ): Promise<UserDocument | null> {
    return this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }
}
