import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoleEnum } from '../../roles/roles.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @ApiProperty({ minLength: 6, example: 'S3cur3P@ssw0rd!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.user })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role: RoleEnum;
}
