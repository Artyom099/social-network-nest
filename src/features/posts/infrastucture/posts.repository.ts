import { Injectable } from '@nestjs/common';
import { PostInputModel } from '../api/models/post.input.model';
import { LikeStatus } from '../../../infrastructure/utils/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../posts.schema';
import { Model } from 'mongoose';
import { PostViewModel } from '../api/models/post.view.model';
import { PostDBModel } from '../api/models/post.db.model';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(post: PostDBModel): Promise<PostViewModel> {
    await this.postModel.create(post);
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
