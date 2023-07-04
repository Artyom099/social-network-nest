import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BlogInputModel } from './blogs.models';

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
  createdAt: number;
  @Prop({ required: true, default: false })
  isMembership: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type BlogModelStaticType = {
  createBlog: (blog: BlogInputModel) => any;
};

export type BlogModelType = Model<BlogDocument> & BlogModelStaticType;
