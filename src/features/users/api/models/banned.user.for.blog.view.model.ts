export type BannedUserForBlogViewModel = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};
