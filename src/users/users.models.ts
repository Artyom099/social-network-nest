import { SortBy, SortDirection } from '../utils/constants';
import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

export type GetUsersWithPagingAndSearch = {
  sortBy: SortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string;
  searchEmailTerm: string;
};
export type CreateUserInputModel = {
  login: string;
  password: string;
  email: string;
};
export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
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
  @Prop({ required: true, type: String })
  createdAt: string;
}

const AccountDataSchema = SchemaFactory.createForClass(AccountData);

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, type: String, unique: true, index: true })
  id: string;
  @Prop({ type: AccountDataSchema, required: true })
  accountData: AccountData;

  static create(
    createUserInputModel: CreateUserInputModel,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const accountData = new AccountData();
    accountData.login = createUserInputModel.login;
    accountData.email = createUserInputModel.email;
    accountData.passwordSalt = passwordSalt;
    accountData.passwordHash = passwordHash;
    accountData.createdAt = new Date().toISOString();
    const user = new User();
    user.id = randomUUID();
    user.accountData = accountData;
    return user;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
