import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RoleType } from '../constants/role-type';
import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

export const ROLE_KEY = 'roles';

export const Roles = (...role: RoleType[]) =>
  applyDecorators(
    SetMetadata(ROLE_KEY, role),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
  );
