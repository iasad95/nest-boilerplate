import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { RoleEnum } from '../../../../roles/roles.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
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
      const existing = await this.repository.findOne({
        where: { email: user.email },
      });
      if (!existing) {
        await this.repository.save(
          this.repository.create({
            email: user.email,
            password: await hash(user.password, 10),
            role: user.role,
          }),
        );
      }
    }
  }
}
