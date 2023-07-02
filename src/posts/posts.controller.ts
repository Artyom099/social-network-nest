import {
  Body,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetItemsWithPaging } from '../utils/common.models';
import { PostInputModel } from './posts.models';

@Injectable()
export class PostsController {
  constructor(protected postsService: PostsService) {}
  @Get()
  async getPosts(@Query() query: GetItemsWithPaging) {}
  @Post()
  async createPost(@Body() inputModel: PostInputModel) {}

  @Get(':id')
  async getPost() {}
  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() inputModel: PostInputModel,
  ) {}
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {}

  @Get(':id/comments')
  async getCommentsCurrentPost(@Param('id') postId: string) {}
}
