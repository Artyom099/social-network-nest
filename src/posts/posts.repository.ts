import { Injectable } from '@nestjs/common';
import {
  NewestLikesViewModel,
  PostDBModel,
  PostInputModel,
  PostViewModel,
} from './posts.models';
import { LikeStatus } from '../utils/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model } from 'mongoose';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getPost(id: string): Promise<PostViewModel> {
    const post = await this.postModel.findOne({ id }).exec();
    let likesCount = 0;
    let dislikesCount = 0;
    const myStatus = LikeStatus.None;
    const newestLikes: NewestLikesViewModel[] = [];
    // todo - как узнать currentUserId без мидлвейр?
    post.extendedLikesInfo.forEach((s) => {
      // if (s.userId === currentUserId) myStatus = s.status;
      if (s.status === LikeStatus.Dislike) dislikesCount++;
      if (s.status === LikeStatus.Like) {
        likesCount++;
        newestLikes.push({
          addedAt: s.addedAt,
          userId: s.userId,
          login: s.login,
        });
      }
    });
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes: newestLikes
          .sort((a, b) => parseInt(a.addedAt) - parseInt(b.addedAt))
          .slice(-3)
          .reverse(),
      },
    };
  }
  async createPost(post: PostDBModel): Promise<PostViewModel> {
    await this.postModel.create(post);
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }
  async updatePost(id: string, InputModel: PostInputModel) {
    return this.postModel.updateOne({ id }, { InputModel });
  }
  async deletePost(id: string) {
    return this.postModel.deleteOne({ id });
  }
}
