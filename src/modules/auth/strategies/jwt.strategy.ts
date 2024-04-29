import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from './types/jwt-payload.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getBlacklistKey } from 'src/utils/cache';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayloadType) {
    if (!payload || !payload.id) {
      throw new UnauthorizedException();
    }

    const jwtToken = req?.get('authorization')?.replace('Bearer', '').trim();

    if (await this.cacheManager.get(getBlacklistKey(jwtToken))) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
