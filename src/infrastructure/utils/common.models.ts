import { SortBy, SortDirection } from './constants';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { isNil } from '@nestjs/common/utils/shared.utils';

export type GetItemsWithPaging = {
  sortBy: SortBy;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
};
export type GetItemsWithPagingAndSearch = {
  searchNameTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: SortBy;
  sortDirection: SortDirection;
};
export type PagingViewModel<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};

export class DefaultPaginationInput {
  @IsOptional()
  sortBy = SortBy.default;
  @Transform(({ value }) => {
    return value === SortDirection.asc ? SortDirection.asc : SortDirection.desc;
  })
  @IsOptional()
  sortDirection: 'asc' | 'desc' = 'desc';

  pageNumber = 1;
  pageSize = 10;

  sort() {
    return { [this.sortBy]: this.sortDirection };
  }
  skip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export class BlogsPaginationInput extends DefaultPaginationInput {
  @Transform(({ value }) => {
    return !isNil(value) ? value : null;
  })
  @IsOptional()
  searchNameTerm: string;
}
