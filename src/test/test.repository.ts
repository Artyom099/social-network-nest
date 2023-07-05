import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../blogs/blogs.schema';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Post, PostDocument } from '../posts/posts.schema';
import { CommentDocument } from '../comments/comments.schema';

@Injectable()
export class TestRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async deleteAllData() {
    await Promise.all([
      this.userModel.deleteMany(),
      this.blogModel.deleteMany(),
      this.postModel.deleteMany(),
      this.commentModel.deleteMany(),
    ]);
  }
}
