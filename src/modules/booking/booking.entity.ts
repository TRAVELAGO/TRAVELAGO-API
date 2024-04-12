import { BookingStatus } from '@constants/booking-status';
import { Hotel } from '@modules/hotel/hotel.entity';
import { Payment } from '@modules/payment/payment.entity';
import { Room } from '@modules/room/room.entity';
import { User } from '@modules/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'timestamp' })
  dateFrom: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
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

  @ManyToOne(() => Room, (room) => room.bookings)
  room: Room;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;
}
