import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '@database/database-option';
import { AuthModule } from '@modules/auth/auth.module';
import { HotelModule } from './modules/hotel/hotel.module';
import { RoomModule } from '@modules/room/room.module';
import { RoomTypeModule } from '@modules/room-type/room-type.module';
import { PassportModule } from '@nestjs/passport';
import { AmenityService } from '@modules/amenity/amenity.service';
import { AmenityModule } from '@modules/amenity/amenity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    PassportModule,
    AuthModule,
    UserModule,
    HotelModule,
    RoomModule,
    RoomTypeModule,
    AmenityModule,
  ],
  providers: [],
})
export class AppModule {}
