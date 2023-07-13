import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { CreateUserInputModel } from './users.models';
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

  static createUser(
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

  static createUserClass(userFromDb: any): User {
    const accountData = new AccountData();
    accountData.login = userFromDb.accountData.login;
    accountData.email = userFromDb.accountData.email;
    accountData.passwordSalt = userFromDb.accountData.passwordSalt;
    accountData.passwordHash = userFromDb.accountData.passwordHash;
    accountData.createdAt = userFromDb.accountData.createdAt;

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.confirmationCode =
      userFromDb.emailConfirmation.confirmationCode;
    emailConfirmation.expirationDate =
      userFromDb.emailConfirmation.expirationDate;
    emailConfirmation.isConfirmed = userFromDb.emailConfirmation.isConfirmed;

    const user = new User();
    user.id = userFromDb.id;
    user.accountData = userFromDb.accountData;
    user.emailConfirmation = userFromDb.emailConfirmation;
    user.recoveryCode = userFromDb.recoveryCode;
    return user;
  }

  getViewModel() {
    return {
      id: this.id,
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt.toISOString(),
    };
  }

  setRecoveryCode() {
    const code = randomUUID();
    this.recoveryCode = code;
    return code;
  }
  updateConfirmationCode() {
    const newCode = randomUUID();
    this.emailConfirmation.confirmationCode = newCode;
    return newCode;
  }
}
export const UserSchema = SchemaFactory.createForClass(User);

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
// UserSchema.pre('save', () => {});
//
// UserSchema.static(
//   'createUser',
//   function createUser(
//     createUserInputModel: CreateUserInputModel,
//     passwordSalt: string,
//     passwordHash: string,
//   ): User {},
// );
//
// // const statics = {
// //   createUser(
// //     createUserInputModel: CreateUserInputModel,
// //     passwordSalt: string,
// //     passwordHash: string,
// //   ) {
// //     const accountData = new AccountData();
// //     accountData.login = createUserInputModel.login;
// //     accountData.email = createUserInputModel.email;
// //     accountData.passwordSalt = passwordSalt;
// //     accountData.passwordHash = passwordHash;
// //     accountData.createdAt = new Date();
// //
// //     const emailConfirmation = new EmailConfirmation();
// //     emailConfirmation.confirmationCode = randomUUID();
// //     emailConfirmation.expirationDate = add(new Date(), { minutes: 10 });
// //     emailConfirmation.isConfirmed = false;
// //
// //     const userDto = {
// //       id: randomUUID(),
// //       accountData: accountData,
// //       emailConfirmation: emailConfirmation,
// //       recoveryCode: '',
// //     };
// //     return new this(userDto);
// //   },
// // };
// // UserSchema.statics = statics;
// // export type UserModelType = Model<UserDocument> & typeof statics;

export type UserMethodsType = {
  // canBeConfirmed: (code: string) => boolean;
  // confirm: () => void;
  sayHi: () => void;
};

type UserModelType = Model<User, UserMethodsType>;
// type UserModelStaticType = Model<User> & {
//   createUser(
//     createUserInputModel: CreateUserInputModel,
//     passwordSalt: string,
//     passwordHash: string,
//   ): any;
// };

export const UserModel = mongoose.model<User, UserModelType>(
  'Users',
  UserSchema,
);
