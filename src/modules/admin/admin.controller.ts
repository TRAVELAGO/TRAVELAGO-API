import { Controller, Post, Body, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { LoginDto } from './dtos/login.dto';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.adminService.login(loginDto);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('total-hotels')
  async getTotalHotels(): Promise<number> {
    return this.adminService.getTotalHotels();
  }

  @Get('total-bookings')
  async getTotalBookings(): Promise<number> {
    return this.adminService.getTotalBookings();
  }
}
