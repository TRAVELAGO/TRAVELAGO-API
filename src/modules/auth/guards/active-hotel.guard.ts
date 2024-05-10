import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from '../strategies/types/jwt-payload.type';
import { RoleType } from '@constants/role-type';
import { UserStatus } from '@constants/user-status';

@Injectable()
export class ActiveHotelGuard implements CanActivate {
  constructor() { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: JwtPayloadType = request.user;

    return (
      user &&
      (user.role !== RoleType.HOTEL || user.status !== UserStatus.WAIT_ACTIVE)
    );
  }
}
