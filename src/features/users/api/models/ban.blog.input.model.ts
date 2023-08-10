import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BanBlogInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
}
