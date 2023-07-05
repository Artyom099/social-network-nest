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
    const likesCount = 0;
    const dislikesCount = 0;
    const myStatus = LikeStatus.None;
    // todo - написать подсчет лайков, дизлайков, нахождение статуса
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
