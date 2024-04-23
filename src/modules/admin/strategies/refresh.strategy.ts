import { AdminService } from './../admin.service';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from './types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private configService: ConfigService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_RT_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayloadType) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException();
    }

    const refreshToken = req
      ?.get('authorization')
      ?.replace('Bearer', '')
      .trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed.');

    const checkRefreshToken = await this.adminService.checkRefreshToken(
      payload.id,
      refreshToken,
    );

    if (!checkRefreshToken) {
      throw new ForbiddenException('Refresh token has changed.');
    }

    return payload;
  }
}
