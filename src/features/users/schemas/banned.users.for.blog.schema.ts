import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BanUserCurrentBlogInputModel } from '../api/models/ban.user.current.blog.input.model';

@Schema({ _id: false, versionKey: false })
class BanInfo {
  @Prop({ required: true, type: Boolean })
  isBanned: boolean;
  @Prop({ required: true, type: Date })
  banDate: Date;
  @Prop({ required: true, type: String })
  banReason: string;
}
const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

export type BannedUserForBlogDocument = HydratedDocument<BannedUserForBlog>;
@Schema({ versionKey: false })
export class BannedUserForBlog {
  @Prop({ required: true, type: String })
  id: string;
  @Prop({ required: true, type: String })
  blogId: string;
  @Prop({ required: true, type: String })
  login: string;
  @Prop({ required: true, type: BanInfoSchema })
  banInfo: BanInfo;

  static addUserToBanInBlog(
    userId: string,
    login: string,
    inputModel: BanUserCurrentBlogInputModel,
    BannedUserForBlogModel: BannedUserForBlogModelType,
  ): BannedUserForBlogDocument {
    const data = {
      id: userId,
      blogId: inputModel.blogId,
      login,
      banInfo: {
        isBanned: true,
        banDate: new Date(),
        banReason: inputModel.banReason,
      },
    };
    return new BannedUserForBlogModel(data);
  }

  banUserForCurrentBlog(
    login: string,
    inputModel: BanUserCurrentBlogInputModel,
  ) {
    this.blogId = inputModel.blogId;
    this.login = login;
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
    this.banInfo.banReason = inputModel.banReason;
  }
  unbanUserForCurrentBlog() {
    this.banInfo.isBanned = false;
  }
}
export const BannedUserForBlogSchema =
  SchemaFactory.createForClass(BannedUserForBlog);

BannedUserForBlogSchema.methods = {
  banUserForCurrentBlog: BannedUserForBlog.prototype.banUserForCurrentBlog,
  unbanUserForCurrentBlog: BannedUserForBlog.prototype.unbanUserForCurrentBlog,
};
export type BannedUserForBlogModelStaticType = {
  addUserToBanInBlog: (
    userId: string,
    login: string,
    inputModel: BanUserCurrentBlogInputModel,
    BannedUserForBlogModel: BannedUserForBlogModelType,
  ) => BannedUserForBlogDocument;
};
export type BannedUserForBlogModelType = Model<BannedUserForBlog> &
  BannedUserForBlogModelStaticType;
const bannedUserForBlogStaticMethods: BannedUserForBlogModelStaticType = {
  addUserToBanInBlog: BannedUserForBlog.addUserToBanInBlog,
};
BannedUserForBlogSchema.statics = bannedUserForBlogStaticMethods;
