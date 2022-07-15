import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const database = this.configService.getOrThrow('database');
    const app = this.configService.getOrThrow('app');
    return {
      type: database.type as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql',
      url: database.url,
      host: database.host,
      port: database.port,
      username: database.username,
      password: database.password as string | undefined,
      database: database.name as string | undefined,
      synchronize: database.synchronize,
      autoLoadEntities: true,
      logging: app.nodeEnv !== 'production',
    };
  }
}
