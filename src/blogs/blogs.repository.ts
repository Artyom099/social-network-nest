import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from './blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlog(id: string): Promise<BlogViewModel> {
    return this.blogModel.findOne({ id });
  }
  async createBlog(blog: BlogViewModel): Promise<BlogViewModel> {
    return this.blogModel.create(blog);
  }
  async updateBlog(id: string, InputModel: BlogInputModel) {
    await this.blogModel.updateOne({ id }, { InputModel });
  }
  async deleteBlog(id: string) {
    await this.blogModel.deleteOne({ id });
  }
}
