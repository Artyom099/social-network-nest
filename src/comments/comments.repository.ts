import { LikeStatus } from '../utils/constants';
import { CommentInputModel, CommentViewModel } from './comments.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comments.schema';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getComment(id: string): Promise<CommentViewModel | null> {
    const comment = await this.commentModel.findOne({ id }).exec();
    if (!comment) return null;
    const myStatus = LikeStatus.None;
    let likesCount = 0;
    let dislikesCount = 0;
    // todo - как узнать currentUserId без мидлвейр?
    comment.likesInfo.forEach((s) => {
      // if (s.userId === currentUserId) myStatus = s.status;
      if (s.status === LikeStatus.Like) likesCount++;
      if (s.status === LikeStatus.Dislike) dislikesCount++;
    });
    return {
      id: comment.id,
      content: comment.content,
      commentatorIno: {
        userId: comment.commentatorIno.userId,
        userLogin: comment.commentatorIno.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
      },
    };
  }
  async updateComment(id: string, content: CommentInputModel) {
    await this.commentModel.updateOne({ id }, { content });
  }
  async deleteComment(id: string) {
    await this.commentModel.deleteOne({ id });
  }
  async updateCommentLikes(
    id: string,
    newLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const currentUserId = 'mock';

    const comment = await this.commentModel.findOne({ id });
    if (!comment) return false;
    // если юзер есть в массиве, обновляем его статус
    for (const s of comment.likesInfo) {
      if (s.userId === currentUserId) {
        if (s.status === newLikeStatus) return true;
        const result = await this.commentModel.updateOne(
          { id },
          {
            likesInfo: {
              userId: currentUserId,
              status: newLikeStatus,
            },
          },
        );
        return result.modifiedCount === 1;
      }
    }
    // иначе добавляем юзера и его статус в массив
    const result = await this.commentModel.updateOne(
      { id },
      {
        $addToSet: {
          likesInfo: { userId: currentUserId, status: newLikeStatus },
        },
      },
    );
    return result.modifiedCount === 1;
  }
}
