import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class BlogInputModelWithUserId {
  @IsString()
  @IsNotEmpty()
  @Length(3, 15)
  @Transform(({ value }) => value?.trim())
  name: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  @Transform(({ value }) => value?.trim())
  description: string;
  @IsUrl()
  @IsNotEmpty()
  @Length(3, 100)
  @Transform(({ value }) => value?.trim())
  websiteUrl: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  userId: string;
}

export class BlogInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(3, 15)
  @Transform(({ value }) => value?.trim())
  name: string;
  @IsString()
  @IsNotEmpty()
  @Length(3, 500)
  @Transform(({ value }) => value?.trim())
  description: string;
  @IsUrl()
  @IsNotEmpty()
  @Length(3, 100)
  @Transform(({ value }) => value?.trim())
  websiteUrl: string;
}

export type SABlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
};
export type BlogViewModel = Omit<SABlogViewModel, 'blogOwnerInfo'>;

export type BlogCreateDTO = Omit<BlogViewModel, 'id'>;
