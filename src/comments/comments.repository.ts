import { LikeStatus } from '../utils/constants';
import { CommentViewModel } from './comments.models';

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
