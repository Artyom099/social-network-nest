export type BlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};
export type BlogCreateDTO = Omit<BlogViewModel, 'id'>;
export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};
