import { CommentsRepository } from './comments.repository';
import { CommentViewModel } from './comments.models';

export class CommentsService {
  constructor(protected commentsRepository: CommentsRepository) {}
  async getComment(commentId: string): Promise<CommentViewModel> {
    return this.commentsRepository.getComment(commentId);
  }
}
