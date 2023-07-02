export type GetBlogsWithPagingAndSearch = {
  sortBy: string;
  sortDirection: string;
  pageNumber: string;
  pageSize: string;
  searchNameTerm: string;
};
export type CreateBlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};
export type UpdateBlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};
export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};
