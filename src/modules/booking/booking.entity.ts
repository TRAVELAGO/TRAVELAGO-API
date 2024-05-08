import { BookingStatus } from '@constants/booking-status';
import { BookingType } from '@constants/booking-type';
import { Hotel } from '@modules/hotel/hotel.entity';
import { Payment } from '@modules/payment/payment.entity';
import { Room } from '@modules/room/room.entity';
import { User } from '@modules/user/user.entity';
import { Voucher } from '@modules/voucher/voucher.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: BookingStatus.NEW })
  status: BookingStatus;

  @Column({ default: BookingType.ONLINE })
  type: BookingType;

  @Column({ type: 'date' })
  dateFrom: string;

  @Column({ type: 'date' })
  dateTo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalDiscount: number;

  @Column({ type: 'text', nullable: true })
  paymentUrl: string;

  @ManyToOne(() => Voucher)
  @JoinColumn({ name: 'voucherId' })
  voucher: Voucher;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Hotel)
  hotel: Hotel;

  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;
}
