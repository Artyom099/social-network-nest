import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import {
  CommentViewModel,
  CreateCommentModel,
} from '../../api/models/comments.models';
import { Comment } from '../../comments.schema';

export class CreateCommentCommand {
  constructor(public inputModel: CreateCommentModel) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(private commentsRepository: CommentsRepository) {}

  async execute(command: CreateCommentCommand): Promise<CommentViewModel> {
    const { inputModel } = command;
    const createdComment = Comment.create(inputModel);
    return this.commentsRepository.createComment(createdComment);
  }
}
