import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between, Equal } from 'typeorm';
import { RoleType } from '@constants/role-type';
import { User } from '@modules/user/user.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { Booking } from '@modules/booking/booking.entity';
import { Payment } from '@modules/payment/payment.entity';
import { LoginDto } from './dtos/login.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Hotel) private hotelRepository: Repository<Hotel>,
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new UnauthorizedException('Missing email or password');
    }

    const admin = await this.userRepository.findOne({ where: { email } });

    if (!admin || admin.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (admin.role != RoleType.ADMIN) {
      throw new UnauthorizedException('Access denied');
    }

    return { status: true };
  }

  async getHotelOwner() {
    return this.userRepository.find({
      where: {
        role: Equal(RoleType.HOTEL),
        status: 0,
      },
    });
  }

  async getAllUsers() {
    return this.userRepository.findBy({
      role: Not(RoleType.ADMIN),
    });
  }

  async changeUserStatus(userId: string, status: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }
    await this.userRepository.save({ id: userId, status: status });
    return { status: 200 };
  }

  async getTotalHotels(): Promise<number> {
    return this.hotelRepository.count();
  }

  async getTotalUsers(): Promise<{
    totalUsersThisMonth: number;
    totalUsersOverall: number;
  }> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const totalUsersThisMonth = await this.userRepository.count({
      where: {
        createdAt: Between(
          new Date(currentYear, currentMonth - 1, 1),
          new Date(currentYear, currentMonth, 0),
        ),
      },
    });

    const totalUsersOverall = await this.userRepository.count();

    return { totalUsersThisMonth, totalUsersOverall };
  }

  async getTotalBookings(): Promise<number> {
    return this.bookingRepository.count();
  }

  async getTotalSales(): Promise<{
    totalSalesThisMonth: number;
    totalSalesOverall: number;
  }> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const allPayments = await this.paymentRepository.find();
    let totalSalesThisMonth: number = 0;
    let totalSalesOverall: number = 0;

    for (const payment of allPayments) {
      const paymentDate = new Date(payment.createdAt);
      const paymentMonth = paymentDate.getMonth() + 1;
      const paymentYear = paymentDate.getFullYear();

      if (paymentMonth === currentMonth && paymentYear === currentYear) {
        totalSalesThisMonth += Number(payment.amount);
      }

      totalSalesOverall += Number(payment.amount);
    }

    return { totalSalesThisMonth, totalSalesOverall };
  }

  async getUsersSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; count: number }[]> {
    const usersSummary = await this.userRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt) AS date, COUNT(*) AS count')
      .where('user.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(user.createdAt)')
      .orderBy('DATE(user.createdAt)')
      .getRawMany();

    return usersSummary.map((item) => ({
      date: item.date,
      count: parseInt(item.count),
    }));
  }

  async getSalesSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; totalAmount: number }[]> {
    const salesSummary = await this.paymentRepository
      .createQueryBuilder('payment')
      .select(
        'DATE(payment.createdAt) AS date, SUM(payment.amount) AS totalAmount',
      )
      .where('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(payment.createdAt)')
      .orderBy('DATE(payment.createdAt)')
      .getRawMany();

    return salesSummary.map((item) => ({
      date: item.date,
      totalAmount: parseFloat(item.totalAmount),
    }));
  }

  async getBookingsSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; count: number }[]> {
    const bookingsSummary = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('DATE(booking.createdAt) AS date, COUNT(*) AS count')
      .where('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(booking.createdAt)')
      .orderBy('DATE(booking.createdAt)')
      .getRawMany();

    return bookingsSummary.map((item) => ({
      date: item.date,
      count: parseInt(item.count),
    }));
  }

  async getHotelsSummary(
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; count: number }[]> {
    const hotelsSummary = await this.hotelRepository
      .createQueryBuilder('hotel')
      .select('DATE(hotel.createdAt) AS date, COUNT(*) AS count')
      .where('hotel.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(hotel.createdAt)')
      .orderBy('DATE(hotel.createdAt)')
      .getRawMany();

    return hotelsSummary.map((item) => ({
      date: item.date,
      count: parseInt(item.count),
    }));
  }
}