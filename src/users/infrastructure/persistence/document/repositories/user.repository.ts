import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateUserInput,
  PageOptions,
  PaginatedResult,
  PersistedUser,
  UserRepository,
} from '../../user-repository';
import { RoleEnum } from '../../../../../roles/roles.enum';
import { UserDoc, UserDocument } from '../entities/user.schema';

type RawUserDoc = {
  _id: unknown;
  id?: string;
  email: string;
  password: string;
  role: number;
};

@Injectable()
export class DocumentUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDoc>,
  ) {}

  async findAll(opts: PageOptions): Promise<PaginatedResult<PersistedUser>> {
    const skip = (opts.page - 1) * opts.limit;
    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(opts.limit).lean<RawUserDoc[]>().exec(),
      this.userModel.countDocuments(),
    ]);
    return {
      data: users.map((u) => this.toDomain(u)),
      total,
      page: opts.page,
      limit: opts.limit,
    };
  }

  async findByEmail(email: string): Promise<PersistedUser | null> {
    const user = await this.userModel.findOne({ email }).lean<RawUserDoc>().exec();
    return user ? this.toDomain(user) : null;
  }

  async findById(id: number | string): Promise<PersistedUser | null> {
    const user = await this.userModel.findById(String(id)).lean<RawUserDoc>().exec();
    return user ? this.toDomain(user) : null;
  }

  async create(input: CreateUserInput): Promise<PersistedUser> {
    const createdUser = await this.userModel.create({
      email: input.email,
      password: input.password,
      role: input.role,
    });
    return this.toDomain(createdUser.toObject() as RawUserDoc);
  }

  private toDomain(entity: RawUserDoc): PersistedUser {
    return {
      id: entity.id ?? String(entity._id),
      email: entity.email,
      password: entity.password,
      role: entity.role as RoleEnum,
    };
  }
}
