import { FeedbackStatus } from '@constants/feedback-status';
import { Booking } from '@modules/booking/booking.entity';
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
  JoinColumn,
} from 'typeorm';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rate: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'varchar', length: 20 })
  status: FeedbackStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.feedbacks)
  user: User;

  @ManyToOne(() => Room, (room) => room.feedbacks)
  room: Room;

  @OneToOne(() => Booking, (booking) => booking.feedback)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
