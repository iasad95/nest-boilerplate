import { registerAs } from '@nestjs/config';
import { IsString, MinLength } from 'class-validator';
import { AuthConfig } from './auth-config.type';
import validateConfig from '../../utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @MinLength(32, { message: 'AUTH_JWT_SECRET must be at least 32 characters' })
  AUTH_JWT_SECRET: string;

  @IsString()
  @MinLength(1)
  AUTH_JWT_TOKEN_EXPIRES_IN: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    secret: process.env.AUTH_JWT_SECRET as string,
    expires: process.env.AUTH_JWT_TOKEN_EXPIRES_IN as string,
  };
});
