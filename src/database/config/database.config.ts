import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import validateConfig from '../../utils/validate-config';
import { DatabaseConfig } from './database-config.type';

enum DatabaseType {
  postgres = 'postgres',
  mysql = 'mysql',
  mariadb = 'mariadb',
  sqlite = 'sqlite',
  mssql = 'mssql',
  mongodb = 'mongodb',
}

class EnvironmentVariablesValidator {
  @IsEnum(DatabaseType)
  DATABASE_TYPE: string;

  @ValidateIf((envValues) => envValues.DATABASE_URL)
  @IsString()
  DATABASE_URL: string;

  @ValidateIf(
    (envValues) =>
      !envValues.DATABASE_URL &&
      !['sqlite', 'mongodb'].includes(envValues.DATABASE_TYPE),
  )
  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @ValidateIf(
    (envValues) =>
      !envValues.DATABASE_URL &&
      !['sqlite', 'mongodb'].includes(envValues.DATABASE_TYPE),
  )
  @IsInt()
  @Min(0)
  @Max(65535)
  DATABASE_PORT: number;

  @ValidateIf(
    (envValues) =>
      !envValues.DATABASE_URL &&
      !['sqlite', 'mongodb'].includes(envValues.DATABASE_TYPE),
  )
  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  @ValidateIf(
    (envValues) =>
      !envValues.DATABASE_URL &&
      !['sqlite', 'mongodb'].includes(envValues.DATABASE_TYPE),
  )
  @IsString()
  @IsNotEmpty()
  DATABASE_USERNAME: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE: boolean;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    isDocumentDatabase: ['mongodb'].includes(process.env.DATABASE_TYPE ?? ''),
    url: process.env.DATABASE_URL,
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT
      ? parseInt(process.env.DATABASE_PORT, 10)
      : 5432,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  };
});
