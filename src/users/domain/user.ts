import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum } from '../../roles/roles.enum';

export class User {
  @ApiProperty({ example: 1 })
  id: number | string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.user })
  role: RoleEnum;
}
