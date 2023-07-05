import { Injectable } from '@nestjs/common';
import { PagingViewModel } from '../utils/common.models';
import { BlogViewModel } from './blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getSortedBlogs(
    searchNameTerm: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<PagingViewModel<BlogViewModel[]>> {
    const totalCount = await this.blogModel.countDocuments();
    const sortedBlogs = await this.blogModel
      .find()
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
    return {
      pagesCount: Math.ceil(totalCount / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize: pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items: sortedBlogs,
    };
  }
}
