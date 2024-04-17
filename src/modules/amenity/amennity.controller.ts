import { Controller, Post } from '@nestjs/common';
import { AmenityService } from './amenity.service';

@Controller('amenities')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Post('seed')
  async seedData(): Promise<string> {
    try {
      await this.amenityService.seedData();
      return 'Seed data for amenities inserted successfully.';
    } catch (error) {
      console.error(error);
      return 'Failed to seed data for amenities.';
    }
  }
}
