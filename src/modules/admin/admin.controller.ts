import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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

  @Get('hotel-owner')
  async getHotelOwner() {
    return this.adminService.getHotelOwner();
  }

  @Post('users/:userId/status')
  async changeUserStatus(
    @Param('userId') userId: string,
    @Body() body: { status: number },
  ) {
    return this.adminService.changeUserStatus(userId, body.status);
  }

  @Get('total-hotels')
  async getTotalHotels(): Promise<number> {
    return this.adminService.getTotalHotels();
  }

  @Get('total-users')
  async getTotalUsers(): Promise<{
    totalUsersThisMonth: number;
    totalUsersOverall: number;
  }> {
    return this.adminService.getTotalUsers();
  }

  @Get('total-bookings')
  async getTotalBookings(): Promise<number> {
    return this.adminService.getTotalBookings();
  }

  @Get('total-sales')
  async getTotalSales(): Promise<{
    totalSalesThisMonth: number;
    totalSalesOverall: number;
  }> {
    return this.adminService.getTotalSales();
  }
}
