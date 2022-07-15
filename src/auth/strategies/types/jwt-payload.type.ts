import { RoleEnum } from '../../../roles/roles.enum';

export type JwtPayloadType = {
  id: number | string;
  role: RoleEnum;
};
