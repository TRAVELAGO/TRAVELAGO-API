import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class CountryModule {}
