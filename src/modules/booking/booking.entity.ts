import { BookingStatus } from '@constants/index';
import { BookingDetail } from '@modules/booking-detail/booking-detail.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { Payment } from '@modules/payment/payment.entity';
import { User } from '@modules/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'timestamp' })
  dateFrom: Date;

  @Column({ type: 'timestamp' })
  dateTo: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalDiscount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Hotel)
  hotel: Hotel;

  @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.booking)
  bookingDetails: BookingDetail[];

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;
}
