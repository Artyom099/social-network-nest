import { Injectable } from '@nestjs/common';
import { BlogInputModel, BlogViewModel } from './blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(blog: BlogViewModel): Promise<BlogViewModel> {
    const newBLog = await this.blogModel.create(blog);
    return {
      id: blog.id,
      // id: newBLog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
  async updateBlog(id: string, InputModel: BlogInputModel) {
    await this.blogModel.updateOne(
      { id },
      {
        name: InputModel.name,
        description: InputModel.description,
        websiteUrl: InputModel.websiteUrl,
      },
    );
  }
  async deleteBlog(id: string) {
    await this.blogModel.deleteOne({ id });
  }
}