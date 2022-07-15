import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_REPOSITORY } from '../user-repository';
import { UserDocument, UserSchema } from './entities/user.schema';
import { DocumentUserRepository } from './repositories/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserDocument.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [
    DocumentUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DocumentUserRepository,
    },
  ],
  exports: [USER_REPOSITORY, MongooseModule],
})
export class DocumentPersistenceModule {}
