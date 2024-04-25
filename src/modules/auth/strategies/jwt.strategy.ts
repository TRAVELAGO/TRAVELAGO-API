import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadType } from './types/jwt-payload.type';
import { RedisService } from '@modules/redis/redis.service';
import { REDIS_BLACK_LIST_TOKEN_KEY } from '@constants/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
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

    if (
      await this.redisService.SISMEMBER(
        `${REDIS_BLACK_LIST_TOKEN_KEY}|${payload.id}`,
        jwtToken,
      )
    ) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
