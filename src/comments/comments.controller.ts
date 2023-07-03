import { CommentsService } from './comments.service';
import { Get, Injectable, Param } from '@nestjs/common';
import { CommentViewModel } from './comments.models';

@Injectable()
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}
  @Get()
  async getComment(@Param('id') commentId: string): Promise<CommentViewModel> {
    return this.commentsService.getComment(commentId);
  }
}
