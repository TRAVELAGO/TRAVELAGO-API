import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@database/database-option';
import { AuthModule } from '@modules/auth/auth.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { RoomModule } from '@modules/room/room.module';
import { RoomTypeModule } from '@modules/room-type/room-type.module';
import { AdminModule } from '@modules/admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ClearCacheService } from './clear-cache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      auth_pass: process.env.REDIS_AUTH_PASS,
    }),
    PassportModule,
    AuthModule,
    UserModule,
    HotelModule,
    RoomModule,
    RoomTypeModule,
    AdminModule,
  ],
  providers: [ClearCacheService],
})
export class AppModule {}
