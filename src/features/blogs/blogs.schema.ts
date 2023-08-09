import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BlogInputModel } from './api/models/blogs.models';
import { randomUUID } from 'crypto';
import { UserViewModel } from '../users/api/models/users.models';

@Schema({ _id: false, versionKey: false })
class BlogOwnerInfo {
  @Prop({ type: String, required: false })
  userId: string;
  @Prop({ type: String, required: false })
  userLogin: string;
}
const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);

@Schema({ _id: false, versionKey: false })
class BanInfo {
  @Prop({ type: Boolean, required: true })
  isBanned: boolean;
  @Prop({ type: String || null, required: true })
  banDate: string | null;
}
const BanInfoSchema = SchemaFactory.createForClass(BanInfo);

export type BlogDocument = HydratedDocument<Blog>;
@Schema({ versionKey: false })
export class Blog {
  @Prop({ type: String, required: true, unique: true, index: true })
  id: string;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  websiteUrl: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;
  @Prop({ type: BlogOwnerInfoSchema, required: false })
  blogOwnerInfo: BlogOwnerInfo;
  @Prop({ type: BanInfoSchema, required: true })
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
