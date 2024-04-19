import { Controller, Post } from '@nestjs/common';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post('seed')
  async seedCities(): Promise<void> {
    await this.cityService.seedCities();
  }
}
