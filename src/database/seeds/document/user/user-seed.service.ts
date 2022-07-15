import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { RoleEnum } from '../../../../roles/roles.enum';
import {
  UserDoc,
  UserDocument,
} from '../../../../users/infrastructure/persistence/document/entities/user.schema';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDoc>,
  ) {}

  async run() {
    const seedPassword = process.env.SEED_USER_PASSWORD ?? 'ChangeMe_BeforeSeeding!';

    const defaultUsers = [
      {
        email: 'admin@example.com',
        password: seedPassword,
        role: RoleEnum.admin,
      },
      {
        email: 'user@example.com',
        password: seedPassword,
        role: RoleEnum.user,
      },
    ];

    for (const user of defaultUsers) {
      const existing = await this.userModel.findOne({ email: user.email }).exec();
      if (!existing) {
        await this.userModel.create({
          email: user.email,
          password: await hash(user.password, 10),
          role: user.role,
        });
      }
    }
  }
}
