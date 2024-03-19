import { PaymentMethod, PaymentStatus } from '@constants/index';
import { Booking } from '@modules/booking/booking.entity';
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
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: PaymentMethod;

  @Column()
  status: PaymentStatus;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  PaymentDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @OneToOne(() => Booking, (booking) => booking.payment)
  booking: Booking;
}
