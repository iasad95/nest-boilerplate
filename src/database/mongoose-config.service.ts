import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  createMongooseOptions(): MongooseModuleOptions {
    const database = this.configService.getOrThrow('database');
    return {
      uri: database.url,
      dbName: database.name,
      user: database.username,
      pass: database.password,
    };
  }
}
