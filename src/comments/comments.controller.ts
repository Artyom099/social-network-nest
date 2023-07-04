import { CommentsService } from './comments.service';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
} from '@nestjs/common';
import { CommentViewModel } from './comments.models';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getComment(@Param('id') commentId: string): Promise<CommentViewModel> {
    return this.commentsService.getComment(commentId);
  }
}
