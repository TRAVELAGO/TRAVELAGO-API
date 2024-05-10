import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityController } from './city.controller';
import { City } from './city.entity';
import { CityService } from './city.service';
import { CountryModule } from '@modules/country/country.module';

@Module({
  imports: [TypeOrmModule.forFeature([City]), CountryModule],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
