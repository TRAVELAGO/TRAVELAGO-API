import { RoleType } from '@constants/role-type';

export type JwtPayloadType = {
  id: string;
  email: string;
  fullName: string;
  role: RoleType;
  iat?: number;
  exp?: number;
};
