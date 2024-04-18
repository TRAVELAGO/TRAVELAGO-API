import { RoleType } from '@constants/role-type';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';

export const isUser = (user: JwtPayloadType) => {
  return user && user.role === RoleType.USER;
};

export const isHotel = (user: JwtPayloadType) => {
  return user && user.role === RoleType.HOTEL;
};

export const isAdmin = (user: JwtPayloadType) => {
  return user && user.role === RoleType.ADMIN;
};
