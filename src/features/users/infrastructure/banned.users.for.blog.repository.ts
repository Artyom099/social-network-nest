import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  BannedUserForBlog,
  BannedUserForBlogDocument,
  BannedUserForBlogModelType,
} from '../schemas/banned.users.for.blog.schema';
import { BanUserCurrentBlogInputModel } from '../api/models/ban.user.current.blog.input.model';

@Injectable()
export class BannedUsersForBlogRepository {
  constructor(
    @InjectModel(BannedUserForBlog.name)
    private BannedUserForBlogModel: BannedUserForBlogModelType,
  ) {}

  async save(model: any) {
    return model.save();
  }

  async getBannedUserCurrentBlog(
    id: string,
    blogId: string,
  ): Promise<BannedUserForBlogDocument | null> {
    return this.BannedUserForBlogModel.findOne({ id, blogId });
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
