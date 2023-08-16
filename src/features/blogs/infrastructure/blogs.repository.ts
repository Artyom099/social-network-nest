import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../blogs.schema';
import { Model } from 'mongoose';
import { BlogViewModel } from '../api/models/blog.view.model';
import { BlogInputModel } from '../api/models/blog.input.model';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(blog: BlogViewModel): Promise<BlogViewModel> {
    await this.blogModel.create(blog);
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

  async updateBlogOwner(id: string, userId: string, login: string) {
    await this.blogModel.updateOne(
      { id },
      { 'blogOwnerInfo.userId': userId, 'blogOwnerInfo.userLogin': login },
    );
  }

  async banBlog(id: string) {
    await this.blogModel.updateOne(
      { id },
      { 'banInfo.isBanned': true, 'banInfo.banDate': new Date().toISOString() },
    );
  }
  async unbanBlog(id: string) {
    await this.blogModel.updateOne({ id }, { 'banInfo.isBanned': false });
  }
}
