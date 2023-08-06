import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BlogInputModel } from './api/blogs.models';
import { randomUUID } from 'crypto';
import { UserViewModel } from '../users/api/users.models';

@Schema({ _id: false, versionKey: false })
class BlogOwnerInfo {
  @Prop({ required: false })
  userId: string;
  @Prop({ required: false })
  userLogin: string;
}
const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);

export type BlogDocument = HydratedDocument<Blog>;
@Schema({ versionKey: false })
export class Blog {
  @Prop({ required: true, unique: true, index: true })
  id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true, default: false })
  isMembership: boolean;
  @Prop({ type: BlogOwnerInfoSchema, required: false })
  blogOwnerInfo: BlogOwnerInfo;

  static create(InputModel: BlogInputModel, user: UserViewModel) {
    const blog = new Blog();
    blog.id = randomUUID();
    blog.name = InputModel.name;
    blog.description = InputModel.description;
    blog.websiteUrl = InputModel.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;
    blog.blogOwnerInfo = { userId: user.id, userLogin: user.login };
    return blog;
  }
}
export const BlogSchema = SchemaFactory.createForClass(Blog);
