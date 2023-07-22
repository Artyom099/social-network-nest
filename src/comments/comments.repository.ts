import { LikeStatus } from '../utils/constants';
import {
  CommentDBModel,
  CommentInputModel,
  CommentViewModel,
} from './comments.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comments.schema';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getComment(
    id: string,
    currentUserId?: string | null,
  ): Promise<CommentViewModel | null> {
    const comment = await this.commentModel.findOne({ id }).exec();
    if (!comment) return null;
    let myStatus = LikeStatus.None;
    let likesCount = 0;
    let dislikesCount = 0;
    comment.likesInfo.forEach((s) => {
      if (s.userId === currentUserId) myStatus = s.status;
      if (s.status === LikeStatus.Like) likesCount++;
      if (s.status === LikeStatus.Dislike) dislikesCount++;
    });
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
      },
    };
  }

  async createComment(
    createdComment: CommentDBModel,
  ): Promise<CommentViewModel> {
    await this.commentModel.create(createdComment);
    return {
      id: createdComment.id,
      content: createdComment.content,
      commentatorInfo: {
        userId: createdComment.commentatorInfo.userId,
        userLogin: createdComment.commentatorInfo.userLogin,
      },
      createdAt: createdComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    };
  }

  async updateComment(id: string, content: string) {
    await this.commentModel.updateOne({ id }, { content });
  }
  async deleteComment(id: string) {
    await this.commentModel.deleteOne({ id });
  }
  async updateCommentLikes(
    id: string,
    currentUserId: string,
    newLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const comment = await this.commentModel.findOne({ id });
    if (!comment) return false;
    // если юзер есть в массиве likesInfo, обновляем его статус
    for (const s of comment.likesInfo) {
      if (s.userId === currentUserId) {
        if (s.status === newLikeStatus) return true;
        await this.commentModel.updateOne(
          { id },
          {
            likesInfo: {
              userId: currentUserId,
              status: newLikeStatus,
            },
          },
        );
        return true;
      }
    }
    // иначе добавляем юзера и его статус в массив
    await this.commentModel.updateOne(
      { id },
      {
        $addToSet: {
          likesInfo: { userId: currentUserId, status: newLikeStatus },
        },
      },
    );
    return true;
  }
}
