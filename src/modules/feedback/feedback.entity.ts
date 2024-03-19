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

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Room, (room) => room.feedbacks)
  room: Room;
}
