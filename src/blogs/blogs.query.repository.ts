import { Injectable } from '@nestjs/common';
import { GetItemsWithPaging, PagingViewModel } from '../utils/common.models';
import { BlogViewModel } from './blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getSortedBlogs(
    query: GetItemsWithPaging,
  ): Promise<PagingViewModel<BlogViewModel[]>> {
    const totalCount = await this.blogModel.countDocuments();
    const sortedBlogs = await this.blogModel
      .find()
      .sort({ [query.sortBy]: query.sortDirection })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean()
      .exec();
    return {
      pagesCount: Math.ceil(totalCount / query.pageSize), // общее количество страниц
      page: query.pageNumber, // текущая страница
      pageSize: query.pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items: sortedBlogs,
    };
  }
}
