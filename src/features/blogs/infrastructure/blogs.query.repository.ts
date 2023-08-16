import { Injectable } from '@nestjs/common';
import { BlogsPaginationInput } from '../../../infrastructure/utils/common.models';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../blogs.schema';
import { Model } from 'mongoose';
import { SABlogViewModel } from '../api/models/sa.blog.view.model';
import { BlogViewModel } from '../api/models/blog.view.model';
import { PagingViewModel } from '../../../infrastructure/types/paging.view.model';

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

    // const items = sortedBlogs.map((b) => {
    //   return {
    //     id: b.id,
    //     name: b.name,
    //     description: b.description,
    //     websiteUrl: b.websiteUrl,
    //     createdAt: b.createdAt,
    //     isMembership: b.isMembership,
    //     blogOwnerInfo: {
    //       userId: b.blogOwnerInfo.userId,
    //       userLogin: b.blogOwnerInfo.userLogin,
    //     },
    //     banInfo: {
    //       isBanned: b.banInfo.isBanned,
    //       banDate: b.banInfo.banDate,
    //     },
    //   };
    // });

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
    return this.blogModel.findOne(
      { id, 'banInfo.isBanned': false },
      { _id: 0, blogOwnerInfo: 0, banInfo: 0 },
    );
  }
  async getSortedBlogs(
    query: BlogsPaginationInput,
  ): Promise<PagingViewModel<BlogViewModel[]>> {
    const filter = {
      'banInfo.isBanned': false,
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0, blogOwnerInfo: 0, banInfo: 0 })
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
      'banInfo.isBanned': false,
      'blogOwnerInfo.userId': userId,
      name: { $regex: query.searchNameTerm ?? '', $options: 'i' },
    };
    const totalCount = await this.blogModel.countDocuments(filter);
    const items = await this.blogModel
      .find(filter, { _id: 0, blogOwnerInfo: 0, banInfo: 0 })
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
