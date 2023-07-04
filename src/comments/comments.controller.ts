import { CommentsService } from './comments.service';
import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { CommentViewModel } from './comments.models';

@Controller()
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}
  @Get()
  async getComment(@Param('id') commentId: string): Promise<CommentViewModel> {
    return this.commentsService.getComment(commentId);
  }
}
