import { BanStatus, SortBy, SortDirection } from './constants';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { isNil } from '@nestjs/common/utils/shared.utils';

export class DefaultPaginationInput {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : SortBy.default;
  })
  sortBy = SortBy.default;
  @IsOptional()
  @Transform(({ value }) => {
    return value === SortDirection.asc ? SortDirection.asc : SortDirection.desc;
  })
  sortDirection: 'asc' | 'desc' = 'desc';
  @IsOptional()
  @Transform(({ value }) => {
    return value < 1 || value % 1 !== 0 ? 1 : Number(value);
  })
  pageNumber = 1;
  @IsOptional()
  @Transform(({ value }) => {
    return value < 1 || value % 1 !== 0 ? 10 : Number(value);
  })
  pageSize = 10;

  sort() {
    return { [this.sortBy]: this.sortDirection };
  }
  skip(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
  pagesCount(totalCount): number {
    return Math.ceil(totalCount / this.pageSize);
  }
}

export class BlogsPaginationInput extends DefaultPaginationInput {
  @Transform(({ value }) => {
    return !isNil(value) ? value : '';
  })
  @IsOptional()
  searchNameTerm: string;
}

export class UsersPaginationInput extends DefaultPaginationInput {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === BanStatus.banned
      ? true
      : value === BanStatus.notBanned
      ? false
      : null;
  })
  banStatus: boolean | null;
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : '';
  })
  searchLoginTerm: string;
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : '';
  })
  searchEmailTerm: string;

  sortUsers() {
    return { ['accountData.' + this.sortBy]: this.sortDirection };
  }
}

export class BannedUsersPaginationInput extends DefaultPaginationInput {
  @IsOptional()
  @Transform(({ value }) => {
    return !isNil(value) ? value : '';
  })
  searchLoginTerm: string;

  sortBannedUsers() {
    return { [this.sortBy]: this.sortDirection };
  }
}
