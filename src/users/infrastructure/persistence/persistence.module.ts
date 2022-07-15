import { Module } from '@nestjs/common';
import { DocumentPersistenceModule } from './document/document-persistence.module';
import { RelationalPersistenceModule } from './relational/relational-persistence.module';

const isDocumentDatabase = process.env.DATABASE_TYPE === 'mongodb';

const infrastructurePersistenceModule = isDocumentDatabase
  ? DocumentPersistenceModule
  : RelationalPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule],
  exports: [infrastructurePersistenceModule],
})
export class PersistenceModule {}
