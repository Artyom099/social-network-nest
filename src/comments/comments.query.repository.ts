import { Injectable } from '@nestjs/common';
import { CommentViewModel } from './comments.models';
import { LikeStatus } from '../utils/constants';

@Injectable()
export class CommentsQueryRepository {
  async getCommentCurrentPost(postId: string): Promise<CommentViewModel> {
    return {
      id: 'string',
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
