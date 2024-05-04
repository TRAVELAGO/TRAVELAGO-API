import { FeedbackStatus } from '@constants/feedback-status';
import { RoleType } from '@constants/role-type';
import { Room } from '@modules/room/room.entity';
import { User } from '@modules/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rate: number;

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'text' })
  status: FeedbackStatus;

  @Column({ type: 'text' })
  userSend: RoleType;

  @ManyToOne(() => User, user => user.feedbacks)
  user: User;

  @ManyToOne(() => Room, (room) => room.feedbacks)
  room: Room;

}