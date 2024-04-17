import { Hotel } from '@modules/hotel/hotel.entity';
import { User } from '@modules/user/user.entity';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
  hotel?: Hotel[];
};

export type Token = {
  accessToken: string;
  refreshToken: string;
};
