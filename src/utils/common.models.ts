export type GetItemsWithPaging = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
};
export type GetItemsWithPagingAndSearch = {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
  searchNameTerm: string;
};
export type PagingViewModel<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T;
};
