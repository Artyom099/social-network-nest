import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { randomUUID } from 'crypto';
import add from 'date-fns/add';
import { CreateUserInputModel } from '../api/models/create.user.input.model';
import { SAUserViewModel } from '../api/models/sa.user.view.model';
import { UserViewModel } from '../api/models/user.view.model';

@Schema({ _id: false, versionKey: false })
class AccountData {
  @Prop({ required: true, type: String, unique: true })
  login: string;
  @Prop({ required: true, type: String, unique: true })
  email: string;
  @Prop({ required: true, type: String })
  passwordSalt: string;
  @Prop({ required: true, type: String })
  passwordHash: string;
  @Prop({ required: true, type: Date })
  createdAt: Date;
}
const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema({ _id: false, versionKey: false })
class BanInfo {
  @Prop({ required: true, type: Boolean })
  isBanned: boolean;
  @Prop({ required: false, type: Date || null })
  banDate: Date | null;
  @Prop({ required: false, type: String || null })
  banReason: string | null;
}
const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

@Schema({ _id: false, versionKey: false })
class EmailConfirmation {
  @Prop({ required: true, type: String })
  confirmationCode: string;
  @Prop({ required: true, type: Date })
  expirationDate: Date;
  @Prop({ required: true, type: Boolean })
  isConfirmed: boolean;
}
const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

export type UserDocument = HydratedDocument<User>;
@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, type: String, unique: true, index: true })
  id: string;
  @Prop({ required: true, type: String })
  recoveryCode: string;

  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;
  @Prop({ required: true, type: BanInfoSchema })
  banInfo: BanInfo;
  @Prop({ required: true, type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  static createUserByAdmin(
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ): UserDocument {
    const data = {
      id: randomUUID(),
      accountData: {
        login: InputModel.login,
        email: InputModel.email,
        passwordSalt,
        passwordHash,
        createdAt: new Date(),
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { minutes: 10 }),
        isConfirmed: true,
      },
      recoveryCode: randomUUID(),
    };
    return new UserModel(data);
  }

  static createUserBySelf(
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ): UserDocument {
    const data = {
      id: randomUUID(),
      accountData: {
        login: InputModel.login,
        email: InputModel.email,
        passwordSalt,
        passwordHash,
        createdAt: new Date(),
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { minutes: 10 }),
        isConfirmed: false,
      },
      recoveryCode: randomUUID(),
    };
    return new UserModel(data);
  }

  getViewModel(): UserViewModel {
    return {
      id: this.id,
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt.toISOString(),
    };
  }
  getSAViewModel(): SAUserViewModel {
    return {
      id: this.id,
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt.toISOString(),
      banInfo: {
        isBanned: this.banInfo.isBanned,
        banDate: this.banInfo.banDate
          ? this.banInfo.banDate.toISOString()
          : null,
        banReason: this.banInfo.banReason,
      },
    };
  }

  confirmEmail(code: string): boolean {
    if (
      this &&
      !this.emailConfirmation.isConfirmed &&
      this.emailConfirmation.confirmationCode === code &&
      this.emailConfirmation.expirationDate > new Date()
    ) {
      this.emailConfirmation.isConfirmed = true;
      return true;
    } else {
      return false;
    }
  }
  updateSaltAndHash(salt: string, hash: string) {
    this.accountData.passwordSalt = salt;
    this.accountData.passwordHash = hash;
  }
  updateRecoveryCode(): string {
    const code = randomUUID();
    this.recoveryCode = code;
    return code;
  }
  updateConfirmationCode(): string {
    const newCode = randomUUID();
    this.emailConfirmation.confirmationCode = newCode;
    return newCode;
  }

  banUser(reason: string) {
    this.banInfo.isBanned = true;
    this.banInfo.banReason = reason;
    this.banInfo.banDate = new Date();
  }
  unbanUser() {
    this.banInfo.isBanned = false;
    this.banInfo.banReason = null;
    this.banInfo.banDate = null;
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  getViewModel: User.prototype.getViewModel,
  getSAViewModel: User.prototype.getSAViewModel,
  confirmEmail: User.prototype.confirmEmail,
  updateSaltAndHash: User.prototype.updateSaltAndHash,
  updateRecoveryCode: User.prototype.updateRecoveryCode,
  updateConfirmationCode: User.prototype.updateConfirmationCode,
  banUser: User.prototype.banUser,
  unbanUser: User.prototype.unbanUser,
};
export type UserModelStaticType = {
  createUserByAdmin: (
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ) => UserDocument;
  createUserBySelf: (
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ) => UserDocument;
};
export type UserModelType = Model<User> & UserModelStaticType;
const userStaticMethods: UserModelStaticType = {
  createUserByAdmin: User.createUserByAdmin,
  createUserBySelf: User.createUserBySelf,
};
UserSchema.statics = userStaticMethods;
