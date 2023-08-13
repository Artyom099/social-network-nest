import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomUUID } from 'crypto';
import { UserViewModel } from '../users/api/models/user.view.model';
import { BlogInputModel } from './api/models/blog.input.model';

@Schema({ _id: false, versionKey: false })
class BlogOwnerInfo {
  @Prop({ required: false, type: String })
  userId: string;
  @Prop({ required: false, type: String })
  userLogin: string;
}
const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);

@Schema({ _id: false, versionKey: false })
class BanInfo {
  @Prop({ required: true, type: Boolean })
  isBanned: boolean;
  @Prop({ required: false, type: String || null })
  banDate: string | null;
}
const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

export type BlogDocument = HydratedDocument<Blog>;
@Schema({ versionKey: false })
export class Blog {
  @Prop({ required: true, type: String, unique: true, index: true })
  id: string;
  @Prop({ required: true, type: String })
  name: string;
  @Prop({ required: true, type: String })
  description: string;
  @Prop({ required: true, type: String })
  websiteUrl: string;
  @Prop({ required: true, type: String })
  createdAt: string;
  @Prop({ required: true, type: Boolean, default: false })
  isMembership: boolean;
  @Prop({ required: false, type: BlogOwnerInfoSchema })
  blogOwnerInfo: BlogOwnerInfo;
  @Prop({ required: true, type: BanInfoSchema })
  banInfo: BanInfo;

  static create(InputModel: BlogInputModel, user: UserViewModel) {
    const blog = new Blog();
    blog.id = randomUUID();
    blog.name = InputModel.name;
    blog.description = InputModel.description;
    blog.websiteUrl = InputModel.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;
    blog.blogOwnerInfo = { userId: user.id, userLogin: user.login };
    blog.banInfo = { isBanned: false, banDate: null };
    return blog;
  }
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
