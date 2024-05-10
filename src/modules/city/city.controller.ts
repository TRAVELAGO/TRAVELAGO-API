import { Controller, Get, Post } from '@nestjs/common';
import { CityService } from './city.service';
import { ApiTags } from '@nestjs/swagger';
import { City } from './city.entity';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Get()
  async getAll(): Promise<City[]> {
    return this.cityService.getAll();
  }

  @Post('seed')
  async seedCities(): Promise<void> {
    await this.cityService.seedCities();
  }
}
