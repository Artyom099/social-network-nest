import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../blogs/blogs.schema';
import { User, UserDocument } from '../users/schemas/users.schema';
import { Post, PostDocument } from '../posts/posts.schema';
import { Comment, CommentDocument } from '../comments/comments.schema';
import { Device, DeviceDocument } from '../devices/devices.schema';
import {
  Request,
  RequestDocument,
} from '../../infrastructure/services/ip.schema';
import {
  BannedUserForBlog,
  BannedUserForBlogModelType,
} from '../users/schemas/banned.users.for.blog.schema';

@Injectable()
export class TestRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Device.name) private devicesModel: Model<DeviceDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    @InjectModel(BannedUserForBlog.name)
    private BannedUserForBlogModel: BannedUserForBlogModelType,
  ) {}

  async deleteAllData() {
    await Promise.all([
      this.userModel.deleteMany(),
      this.blogModel.deleteMany(),
      this.postModel.deleteMany(),
      this.devicesModel.deleteMany(),
      this.commentModel.deleteMany(),
      this.requestModel.deleteMany(),
      this.BannedUserForBlogModel.deleteMany(),
    ]);
  }
}
