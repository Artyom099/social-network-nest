import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../users.schema';
import { CreateUserInputModel } from '../api/users.models';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: UserModelType,
  ) {}

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
  async deleteUser(id: string) {
    await this.userModel.deleteOne({ id });
  }
}
