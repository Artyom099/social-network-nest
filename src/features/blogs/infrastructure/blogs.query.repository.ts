import { Injectable } from '@nestjs/common';
import {
  BlogsPaginationInput,
  PagingViewModel,
} from '../../../infrastructure/utils/common.models';
import { BlogViewModel, SABlogViewModel } from '../api/blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  //super admin
  async getBlogSA(id: string): Promise<SABlogViewModel | null> {
    return this.blogModel.findOne({ id }, { _id: 0 });
  }
  async getSortedBlogsSA(
    query: BlogsPaginationInput,
  ): Promise<PagingViewModel<SABlogViewModel[]>> {
    const filter = {
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0 })
      .sort(query.sort())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество блогов на странице
      totalCount, // общее количество блогов
      items,
    };
  }

  //regular user
  async getBlog(id: string): Promise<BlogViewModel | null> {
    return this.blogModel.findOne({ id }, { _id: 0, blogOwnerInfo: 0 });
  }
  async getSortedBlogs(
    query: BlogsPaginationInput,
  ): Promise<PagingViewModel<BlogViewModel[]>> {
    const filter = {
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0, blogOwnerInfo: 0 })
      .sort(query.sort())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество блогов на странице
      totalCount, // общее количество блогов
      items,
    };
  }

  // blogger
  async getSortedBlogsCurrentBlogger(
    userId: string,
    query: BlogsPaginationInput,
  ): Promise<PagingViewModel<BlogViewModel[]>> {
    const filter = {
      'blogOwnerInfo.userId': userId,
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0, blogOwnerInfo: 0 })
      .sort(query.sort())
      .skip(query.skip())
      .limit(query.pageSize)
      .lean()
      .exec();

    return {
      pagesCount: query.pagesCount(totalCount), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество блогов на странице
      totalCount, // общее количество блогов
      items,
    };
  }
}
