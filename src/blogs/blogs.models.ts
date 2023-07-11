import { IsNotEmpty, IsUrl, Length } from 'class-validator';

//todo - не работает валидация данных на пост и пут

export class BlogInputModel {
  @IsNotEmpty()
  @Length(3, 15)
  name: string;
  @IsNotEmpty()
  @Length(3, 500)
  description: string;
  @IsNotEmpty()
  @IsUrl()
  @Length(3, 100)
  websiteUrl: string;
}
export type BlogCreateDTO = Omit<BlogViewModel, 'id'>;
export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};
