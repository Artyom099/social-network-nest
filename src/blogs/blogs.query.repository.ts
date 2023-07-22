import { Injectable } from '@nestjs/common';
import { PagingViewModel } from '../utils/common.models';
import { BlogViewModel } from './blogs.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlog(id: string): Promise<BlogViewModel | null> {
    return this.blogModel.findOne({ id }, { _id: 0 });
  }

  async getSortedBlogs(
    searchNameTerm: string | null,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
  ): Promise<PagingViewModel<BlogViewModel[]>> {
    const filter = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0 })
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean()
      .exec();
    return {
      pagesCount: Math.ceil(totalCount / pageSize), // общее количество страниц
      page: pageNumber, // текущая страница
      pageSize, // количество пользователей на странице
      totalCount, // общее количество пользователей
      items,
    };
  }
}
