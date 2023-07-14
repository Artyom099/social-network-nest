import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateUserInputModel, UserViewModel } from './users.models';
import add from 'date-fns/add';

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
  @Prop({ type: AccountDataSchema, required: true })
  accountData: AccountData;
  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: String, required: true })
  recoveryCode: string;

  static createUserByAdmin(
    createUserInputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
  ): User {
    const accountData = new AccountData();
    accountData.login = createUserInputModel.login;
    accountData.email = createUserInputModel.email;
    accountData.passwordSalt = passwordSalt;
    accountData.passwordHash = passwordHash;
    accountData.createdAt = new Date();

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.confirmationCode = randomUUID();
    emailConfirmation.expirationDate = add(new Date(), { minutes: 10 });
    emailConfirmation.isConfirmed = true;

    const user = new User();
    user.id = randomUUID();
    user.accountData = accountData;
    user.emailConfirmation = emailConfirmation;
    user.recoveryCode = '';
    return user;
  }
  static createUserBySelf(
    createUserInputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
  ): User {
    const accountData = new AccountData();
    accountData.login = createUserInputModel.login;
    accountData.email = createUserInputModel.email;
    accountData.passwordSalt = passwordSalt;
    accountData.passwordHash = passwordHash;
    accountData.createdAt = new Date();

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.confirmationCode = randomUUID();
    emailConfirmation.expirationDate = add(new Date(), { minutes: 10 });
    emailConfirmation.isConfirmed = false;

    const user = new User();
    user.id = randomUUID();
    user.accountData = accountData;
    user.emailConfirmation = emailConfirmation;
    user.recoveryCode = '';
    return user;
  }

  static createUserClass(
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
      emailConfirmation: {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { minutes: 10 }),
        isConfirmed: true,
      },
      recoveryCode: '1',
    };
    return new UserModel(data);

    // const accountData = new AccountData();
    // accountData.login = userFromDb.accountData.login;
    // accountData.email = userFromDb.accountData.email;
    // accountData.passwordSalt = userFromDb.accountData.passwordSalt;
    // accountData.passwordHash = userFromDb.accountData.passwordHash;
    // accountData.createdAt = userFromDb.accountData.createdAt;
    //
    // const emailConfirmation = new EmailConfirmation();
    // emailConfirmation.confirmationCode =
    //   userFromDb.emailConfirmation.confirmationCode;
    // emailConfirmation.expirationDate =
    //   userFromDb.emailConfirmation.expirationDate;
    // emailConfirmation.isConfirmed = userFromDb.emailConfirmation.isConfirmed;
    //
    // const user = new UserModel();
    // user.id = userFromDb.id;
    // user.accountData = userFromDb.accountData;
    // user.emailConfirmation = userFromDb.emailConfirmation;
    // user.recoveryCode = userFromDb.recoveryCode;
    // return user;
  }

  getViewModel(): UserViewModel {
    return {
      id: this.id,
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt.toISOString(),
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
}
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  getViewModel: User.prototype.getViewModel,
  confirmEmail: User.prototype.confirmEmail,
  updateSaltAndHash: User.prototype.updateSaltAndHash,
  updateRecoveryCode: User.prototype.updateRecoveryCode,
  updateConfirmationCode: User.prototype.updateConfirmationCode,
};

export type UserModelStaticType = {
  createUserClass: (
    InputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
    UserModel: UserModelType,
  ) => UserDocument;
};
const userStaticMethods: UserModelStaticType = {
  createUserClass: User.createUserClass,
};
UserSchema.statics = userStaticMethods;
export type UserModelType = Model<User> & UserModelStaticType;

// UserSchema.method('canBeConfirmed', function canBeConfirmed(code: string) {
//   return (
//     this &&
//     !this.emailConfirmation.isConfirmed &&
//     this.emailConfirmation.confirmationCode === code &&
//     this.emailConfirmation.expirationDate > new Date()
//   );
// });
// UserSchema.method('confirm', function confirm() {
//   if (this.emailConfirmation.isConfirmed) {
//     throw new Error('Already confirmed');
//   } else {
//     this.emailConfirmation.isConfirmed = true;
//   }
// });
//
// UserSchema.statics = statics;
// export type UserModelType = Model<UserDocument> & typeof statics;

// export type UserMethodsType = {
//   canBeConfirmed: (code: string) => boolean;
//   confirm: () => void;
// };
// type UserModelType = Model<User, UserMethodsType>;
