import { RoleType } from '@constants/role-type';
import { UserStatus } from '@constants/user-status';

export type JwtPayloadType = {
  id: string;
  email: string;
  fullName: string;
  role: RoleType;
  status: UserStatus;
  iat?: number;
  exp?: number;
};
