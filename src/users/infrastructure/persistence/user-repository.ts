import { RoleEnum } from '../../../roles/roles.enum';

export type CreateUserInput = {
  email: string;
  password: string;
  role: RoleEnum;
};

export type PersistedUser = {
  id: number | string;
  email: string;
  password: string;
  role: RoleEnum;
};

export type PageOptions = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export interface UserRepository {
  findAll(opts: PageOptions): Promise<PaginatedResult<PersistedUser>>;
  findByEmail(email: string): Promise<PersistedUser | null>;
  findById(id: number | string): Promise<PersistedUser | null>;
  create(input: CreateUserInput): Promise<PersistedUser>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
