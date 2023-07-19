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

  async getPost(id: string): Promise<PostViewModel | null> {
    const post = await this.postModel.findOne({ id }).exec();
    if (!post) return null;
    let likesCount = 0;
    let dislikesCount = 0;
    const myStatus = LikeStatus.None;
    const newestLikes: NewestLikesViewModel[] = [];
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
    const newPost = await this.postModel.create(post);
    return {
      // id: newPost._id.toString(),
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
    return this.postModel.updateOne(
      { id },
      {
        title: InputModel.title,
        shortDescription: InputModel.shortDescription,
        content: InputModel.content,
      },
    );
  }
  async deletePost(id: string) {
    return this.postModel.deleteOne({ id });
  }

  async updatePostLikes(
    id: string,
    userId: string,
    newLikeStatus: LikeStatus,
    addedAt: Date,
    login: string,
  ) {
    const post = await this.postModel.findOne({ id });
    if (!post) return false;
    // если юзер есть в массиве, обновляем его статус
    for (const s of post.extendedLikesInfo) {
      if (s.userId === userId) {
        if (s.status === newLikeStatus) return true;
        return this.postModel.updateOne(
          { id },
          {
            extendedLikesInfo: {
              addedAt,
              userId,
              status: newLikeStatus,
              login,
            },
          },
        );
      }
    }
    // иначе добавляем юзера, его лайк статус, дату и логин в массив
    return this.postModel.updateOne(
      { id },
      {
        $addToSet: {
          extendedLikesInfo: {
            addedAt,
            userId,
            status: newLikeStatus,
            login,
          },
        },
      },
    );
  }
}
