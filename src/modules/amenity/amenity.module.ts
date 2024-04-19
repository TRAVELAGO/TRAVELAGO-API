import { Module } from '@nestjs/common';
import { Amenity } from './amenity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmenityService } from './amenity.service';
import { AmenityController } from './amennity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Amenity])],
  providers: [AmenityService],
  controllers: [AmenityController],
})
export class AmenityModule {}
