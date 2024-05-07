import { RoleType } from '@constants/role-type';
import { ROLE_KEY } from './roles.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ActiveHotelGuard } from '@modules/auth/guards/active-hotel.guard';

export const ActiveHotel = () =>
  applyDecorators(
    SetMetadata(ROLE_KEY, [RoleType.HOTEL]),
    UseGuards(JwtAuthGuard, RolesGuard, ActiveHotelGuard),
    ApiBearerAuth(),
  );
