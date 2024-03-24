import { RoleType } from '../constants/role-type';
import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'roles';

export const Roles = (role: RoleType[]) => SetMetadata(ROLE_KEY, role);
