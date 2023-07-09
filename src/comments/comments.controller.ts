import { CommentsService } from './comments.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { CommentInputModel, CommentViewModel } from './comments.models';
import { LikeStatus } from '../utils/constants';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getComment(
    @Param('id') commentId: string,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.commentsService.getComment(commentId);
    if (!foundComment) {
      throw new NotFoundException();
    } else {
      return this.commentsService.getComment(commentId);
    }
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('id') commentId: string,
    @Body() content: CommentInputModel,
  ) {
    const foundComment = await this.commentsService.getComment(commentId);
    if (!foundComment) {
      throw new NotFoundException();
    }
    //todo - добавить проверку юзер айди найденного коммента - FORBIDDEN_403
    return this.commentsService.updateComment(commentId, content);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('id') commentId: string) {
    const foundComment = await this.commentsService.getComment(commentId);
    if (!foundComment) {
      throw new NotFoundException();
    }
    //todo - добавить проверку юзер айди найденного коммента - FORBIDDEN_403
    return this.commentsService.deleteComment(commentId);
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('id') commentId: string,
    @Body() likeStatus: LikeStatus,
  ) {
    const foundComment = await this.commentsService.getComment(commentId);
    if (!foundComment) {
      throw new NotFoundException();
    } else {
      return this.commentsService.updateCommentLikes(commentId, likeStatus);
    }
  }
}
