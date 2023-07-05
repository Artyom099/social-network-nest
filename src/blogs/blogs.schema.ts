import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BlogInputModel } from './blogs.models';
import { randomUUID } from 'crypto';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
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

  static create(InputModel: BlogInputModel) {
    const blog = new Blog();
    blog.id = randomUUID();
    blog.name = InputModel.name;
    blog.description = InputModel.description;
    blog.websiteUrl = InputModel.websiteUrl;
    blog.createdAt = new Date().toISOString();
    blog.isMembership = false;
    return blog;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
