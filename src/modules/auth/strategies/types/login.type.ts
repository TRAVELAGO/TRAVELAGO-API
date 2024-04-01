import { User } from '@modules/user/user.entity';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
};

export type Token = {
  accessToken: string;
  refreshToken: string;
};
