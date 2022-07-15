import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const options = {
  type: (process.env.DATABASE_TYPE ?? 'postgres') as
    | 'postgres'
    | 'mysql'
    | 'mariadb'
    | 'sqlite'
    | 'mssql',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
};

export const AppDataSource = new DataSource(options as DataSourceOptions);
