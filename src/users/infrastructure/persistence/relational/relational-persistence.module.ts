import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USER_REPOSITORY } from '../user-repository';
import { UserEntity } from './entities/user.entity';
import { RelationalUserRepository } from './repositories/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    RelationalUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: RelationalUserRepository,
    },
  ],
  exports: [USER_REPOSITORY, TypeOrmModule],
})
export class RelationalPersistenceModule {}
