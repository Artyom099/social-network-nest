import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../users.schema';
import { CreateUserInputModel } from '../api/models/create.user.input.model';
import {
  BannedUserForBlog,
  BannedUserForBlogDocument,
  BannedUserForBlogModelType,
} from '../banned.users.for.blogs.schema';
import { BanUserCurrentBlogInputModel } from '../api/models/ban.user.current.blog.input.model';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: UserModelType,
    @InjectModel(BannedUserForBlog.name)
    private BannedUserForBlogModel: BannedUserForBlogModelType,
  ) {}

  async createUserByAdmin(
    InputModel: CreateUserInputModel,
    salt: string,
    hash: string,
  ) {
    return User.createUserByAdmin(InputModel, salt, hash, this.userModel);
  }

  async createUserBySelf(
    InputModel: CreateUserInputModel,
    salt: string,
    hash: string,
  ) {
    return User.createUserBySelf(InputModel, salt, hash, this.userModel);
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

  //--------------------------------------

  async getBannedUserCurrentBlog(
    id: string,
    blogId: string,
  ): Promise<BannedUserForBlogDocument | null> {
    return this.BannedUserForBlogModel.findOne({ id, blogId });
  }

  async getBannedUsers(id: string): Promise<BannedUserForBlogDocument | null> {
    return this.BannedUserForBlogModel.findOne({ id });
  }

  async addUserToBanInBlog(
    userId: string,
    login: string,
    inputModel: BanUserCurrentBlogInputModel,
  ) {
    return BannedUserForBlog.addUserToBanInBlog(
      userId,
      login,
      inputModel,
      this.BannedUserForBlogModel,
    );
  }
}
