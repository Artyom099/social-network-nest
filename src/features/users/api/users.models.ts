import {
  BanStatus,
  SortBy,
  SortDirection,
} from '../../../infrastructure/utils/constants';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(3, 10)
  @Transform(({ value }) => value?.trim())
  login: string;
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  email: string;
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  @Transform(({ value }) => value?.trim())
  password: string;
}
export class BanUserInputModel {
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;
  @IsString()
  @Length(20)
  @Transform(({ value }) => value?.trim())
  banReason: string;
}
export type SAUserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};
export type UserViewModel = Omit<SAUserViewModel, 'banInfo'>;

export type UserDBModel = {
  id: string;
  accountData: {
    login: string;
    email: string;
    passwordSalt: string;
    passwordHash: string;
    createdAt: Date;
  };
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  recoveryCode: string;
};
export type GetUsersWithPagingAndSearch = {
  sortDirection: SortDirection;
  banStatus: BanStatus;
  sortBy: SortBy;
  searchLoginTerm: string;
  searchEmailTerm: string;
  pageNumber: number;
  pageSize: number;
};
export type SaltHashModel = {
  salt: string;
  hash: string;
};
