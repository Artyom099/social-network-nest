import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Length,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/blogs.query.repository';

@Injectable()
@ValidatorConstraint({ name: 'BlogExists', async: true })
export class BlogExistsConstraint implements ValidatorConstraintInterface {
  constructor(private blogsQueryRepo: BlogsQueryRepository) {}
  async validate(id: string) {
    const blog = await this.blogsQueryRepo.getBlog(id);
    return !!blog;
  }
  defaultMessage() {
    return "Blog with this id doesn't exist";
  }
}

export class BanUserCurrentBlogInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
  @IsString()
  @Length(20)
  @Transform(({ value }) => value?.trim())
  banReason: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  // todo - как здесь использовать BlogExistsConstraint?
  blogId: string;
}
