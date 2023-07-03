import { LikeStatus } from '../utils/constants';
import { CommentViewModel } from './comments.models';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  async getComment(id: string): Promise<CommentViewModel> {
    return {
      id,
      content: 'string',
      commentatorIno: {
        userId: 'string',
        userLogin: 'string',
      },
      createdAt: 'string',
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
      },
    };
  }
}
