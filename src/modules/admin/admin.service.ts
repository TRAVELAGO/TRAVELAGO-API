import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { RoleType } from '@constants/role-type';
import { User } from '@modules/user/user.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { Booking } from '@modules/booking/booking.entity';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    @InjectRepository(Hotel)
    @InjectRepository(Booking)
    private readonly userRepository: Repository<User>,
    private readonly hotelRepository: Repository<Hotel>,
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const admin = await this.userRepository.findOne({ where: { email } });

    if (!admin || admin.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (admin.role != RoleType.ADMIN) {
      throw new UnauthorizedException('Access denied');
    }

    return { status: true };
  }

  async getAllUsers() {
    return this.userRepository.findBy({
      role: Not(RoleType.ADMIN),
  });
  }

  async getTotalHotels(): Promise<number> {
    return this.hotelRepository.count();
  }

  async getTotalBookings(): Promise<number> {
    return this.bookingRepository.count();
  }
}
