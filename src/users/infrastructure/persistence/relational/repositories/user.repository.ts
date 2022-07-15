import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserInput,
  PageOptions,
  PaginatedResult,
  PersistedUser,
  UserRepository,
} from '../../user-repository';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class RelationalUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(opts: PageOptions): Promise<PaginatedResult<PersistedUser>> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
    });
    return {
      data: users.map((u) => this.toDomain(u)),
      total,
      page: opts.page,
      limit: opts.limit,
    };
  }

  async findByEmail(email: string): Promise<PersistedUser | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: number | string): Promise<PersistedUser | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) return null;
    const user = await this.userRepository.findOne({ where: { id: numericId } });
    return user ? this.toDomain(user) : null;
  }

  async create(input: CreateUserInput): Promise<PersistedUser> {
    const user = this.userRepository.create({
      email: input.email,
      password: input.password,
      role: input.role,
    });
    const savedUser = await this.userRepository.save(user);
    return this.toDomain(savedUser);
  }

  private toDomain(entity: UserEntity): PersistedUser {
    return {
      id: entity.id,
      email: entity.email,
      password: entity.password,
      role: entity.role,
    };
  }
}
