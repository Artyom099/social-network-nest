import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
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

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, type: String, unique: true, index: true })
  id: string;
  @Prop({ type: AccountDataSchema, required: true })
  accountData: AccountData;
  @Prop({ type: EmailConfirmation, required: true })
  emailConfirmation: EmailConfirmation;
  @Prop({ type: String, required: true })
  recoveryCode: string;

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
}
export const UserSchema = SchemaFactory.createForClass(User);
