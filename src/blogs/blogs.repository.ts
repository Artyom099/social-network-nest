import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from './blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlog(id: string): Promise<BlogViewModel | null> {
    return this.blogModel.findOne({ id });
  }
  async createBlog(blog: BlogViewModel): Promise<BlogViewModel> {
    const newBLog = await this.blogModel.create(blog);
    return {
      id: newBLog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
  async updateBlog(id: string, InputModel: BlogInputModel) {
    await this.blogModel.updateOne({ id }, { InputModel });
  }
  async deleteBlog(id: string) {
    await this.blogModel.deleteOne({ id });
  }
}
