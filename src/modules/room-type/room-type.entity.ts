import { Room } from '@modules/room/room.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class RoomType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  bedType1: string;

  @Column({ length: 120, nullable: true })
  bedType2: string;

  @Column({ type: 'tinyint' })
  numberBedType1: number;

  @Column({ nullable: true, type: 'tinyint' })
  numberBedType2: number;

  @Column({ type: 'tinyint' })
  guestNumber: number;

  @Column()
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Room, (room) => room.roomType)
  rooms: Room[];
}
