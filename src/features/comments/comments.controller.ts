import { CommentsService } from './comments.service';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CommentInputModel,
  CommentViewModel,
  LikeStatusInputModel,
} from './comments.models';
import { BearerAuthGuard } from '../../infrastructure/guards/bearer-auth.guard';
import { CheckUserIdGuard } from '../../infrastructure/guards/check-userId.guard';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsService: CommentsService) {}

  @Get(':id')
  @UseGuards(CheckUserIdGuard)
  @HttpCode(HttpStatus.OK)
  async getComment(
    @Req() req,
    @Param('id') commentId: string,
  ): Promise<CommentViewModel | null> {
    const foundComment = await this.commentsService.getComment(
      commentId,
      req.userId,
    );
    if (!foundComment) {
      throw new NotFoundException();
    } else {
      return foundComment;
    }
  }

  @Put(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Req() req,
    @Param('id') commentId: string,
    @Body() InputModel: CommentInputModel,
  ) {
    const foundComment = await this.commentsService.getComment(commentId);
    if (!foundComment) {
      throw new NotFoundException();
    }
    if (req.userId !== foundComment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }
    return this.commentsService.updateComment(commentId, InputModel.content);
  }

  @Delete(':id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Req() req, @Param('id') commentId: string) {
    const foundComment = await this.commentsService.getComment(
      commentId,
      req.userId,
    );
    if (!foundComment) {
      throw new NotFoundException();
    }
    if (req.userId !== foundComment.commentatorInfo.userId) {
      throw new ForbiddenException();
    }
    return this.commentsService.deleteComment(commentId);
  }

  @Put(':id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Req() req,
    @Param('id') commentId: string,
    @Body() InputModel: LikeStatusInputModel,
  ) {
    const foundComment = await this.commentsService.getComment(commentId);
    console.log({ foundComment: foundComment });
    if (!foundComment) {
      throw new NotFoundException();
    } else {
      return this.commentsService.updateCommentLikes(
        commentId,
        req.userId,
        InputModel.likeStatus,
      );
    }
  }
}
