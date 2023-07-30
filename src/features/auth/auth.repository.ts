import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Model } from 'mongoose';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // async getUserByLoginOrEmail(
  //   loginOrEmail: string,
  // ): Promise<UserDBModel | null> {
  //   return this.userModel.findOne({
  //     $or: [
  //       { 'accountData.email': loginOrEmail },
  //       { 'accountData.login': loginOrEmail },
  //     ],
  //   });
  // }
  // async getUserByConfirmationCode(code: string): Promise<UserDBModel | null> {
  //   return this.userModel.findOne({
  //     'emailConfirmation.confirmationCode': code,
  //   });
  // }
  // async setRecoveryCode(email: string, recoveryCode: string) {
  //   await this.userModel.updateOne(
  //     { 'accountData.email': email },
  //     { $set: { recoveryCode: recoveryCode } },
  //   );
  // }
  // async updateEmailConfirmation(id: string) {
  //   await this.userModel.updateOne(
  //     { id },
  //     { $set: { 'emailConfirmation.isConfirmed': true } },
  //   );
  // }
  // async updateConfirmationCode(email: string, code: string) {
  //   await this.userModel.updateOne(
  //     { 'accountData.email': email },
  //     { $set: { 'emailConfirmation.confirmationCode': code } },
  //   );
  // }
  // async updateSaltAndHash(code: string, salt: string, hash: string) {
  //   await this.userModel.updateOne(
  //     { recoveryCode: code },
  //     {
  //       $set: {
  //         'accountData.passwordSalt': salt,
  //         'accountData.passwordHash': hash,
  //       },
  //     },
  //   );
  // }
}
