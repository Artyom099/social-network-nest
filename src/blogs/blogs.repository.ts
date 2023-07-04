import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from './blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelStaticType,
  BlogModelType,
} from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}
  async getBlog(id: string): Promise<BlogViewModel> {
    return this.blogModel.findOne({ id });
    // return {
    //   id,
    //   name: 'name',
    //   description: 'description',
    //   websiteUrl: 'websiteUrl',
    //   createdAt: new Date().toISOString(),
    //   isMembership: true,
    // };
  }
  async createBlog(blog: BlogViewModel): Promise<BlogViewModel> {
    const createdBlog = this.blogModel.createBlog(blog);
    return createdBlog.save();
    // return blog;
  }
  async updateBlog(id: string, InputModel: BlogInputModel) {
    return;
  }
  async deleteBlog(id: string) {
    return;
  }
}
