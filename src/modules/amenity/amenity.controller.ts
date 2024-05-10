import { Amenity } from './amenity.entity';
import { Controller, Get, Post } from '@nestjs/common';
import { AmenityService } from './amenity.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Amenities')
@Controller('amenities')
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Get()
  async getAll(): Promise<Amenity[]> {
    return this.amenityService.getAll();
  }

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
