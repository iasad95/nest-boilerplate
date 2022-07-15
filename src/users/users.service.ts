import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './domain/user';
import {
  PageOptions,
  PaginatedResult,
  PersistedUser,
  USER_REPOSITORY,
  UserRepository,
} from './infrastructure/persistence/user-repository';
import { toPublicUser } from './mappers/user.mapper';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(opts: PageOptions): Promise<PaginatedResult<User>> {
    const result = await this.userRepository.findAll(opts);
    return {
      data: result.data.map(toPublicUser),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  async findById(id: number | string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    return user ? toPublicUser(user) : null;
  }

  findByEmail(email: string): Promise<PersistedUser | null> {
    return this.userRepository.findByEmail(email.trim().toLowerCase());
  }

  async create(dto: CreateUserDto): Promise<User> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hash(dto.password, 10);
    const createdUser = await this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: dto.role,
    });

    return toPublicUser(createdUser);
  }
}
