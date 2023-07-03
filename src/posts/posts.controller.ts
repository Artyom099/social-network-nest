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
import { QueryRepository } from '../query/query.repository';
import { BlogsService } from '../blogs/blogs.service';
import { BlogsRepository } from '../blogs/blogs.repository';

@Injectable()
export class PostsController {
  constructor(protected postsService: PostsService) {}
  @Get()
  async getPosts(@Query() query: GetItemsWithPaging) {
    const queryRepository = new QueryRepository();
    return queryRepository.getSortedPosts(query);
  }
  @Post()
  async createPost(@Body() inputModel: PostInputModel) {
    // todo – правильно ли я делаю, когда мне надо в PostsController использовать метод BlogsService?
    const blog = new BlogsService(new BlogsRepository());
    const foundBLog = await blog.getBlog(inputModel.blogId);
    return this.postsService.createPost(foundBLog, inputModel);
  }

  @Get(':id')
  async getPost(@Param('id') postId: string) {
    return this.postsService.getPost(postId);
  }
  @Put(':id')
  async updatePost(
    @Param('id') postId: string,
    @Body() inputModel: PostInputModel,
  ) {
    return this.postsService.updatePost(postId, inputModel);
  }
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    return this.postsService.deletePost(postId);
  }

  @Get(':id/comments')
  async getCommentsCurrentPost(@Param('id') postId: string) {
    const queryRepository = new QueryRepository();
    return queryRepository.getCommentsCurrentPost(postId);
  }
}
