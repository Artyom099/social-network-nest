import { LikeStatus } from '../utils/constants';
import { CommentViewModel } from './comments.models';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument } from './comments.schema';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getComment(id: string): Promise<CommentViewModel> {
    const comment = await this.commentModel.findOne({ id }).exec();
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
}
