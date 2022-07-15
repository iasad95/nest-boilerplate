import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllConfigType } from './config/config.type';
import { StructuredLogger } from './common/logger/structured-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(StructuredLogger);
  app.useLogger(logger);
  app.flushLogs();
  const configService = app.get(ConfigService<AllConfigType>);
  const appConfig = configService.getOrThrow('app');

  app.use(helmet());

  if (appConfig.corsOrigin) {
    app.enableCors({ origin: appConfig.corsOrigin });
  }

  app.enableShutdownHooks();
  app.setGlobalPrefix(appConfig.apiPrefix, {
    exclude: ['/'],
  });
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  if (appConfig.nodeEnv !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('API')
      .setDescription('API docs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, options));
  }

  await app.listen(appConfig.port);
}
bootstrap();
