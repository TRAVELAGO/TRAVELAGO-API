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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  bedType1: string;

  @Column({ length: 120, nullable: true })
  bedType2: string;

  @Column({ type: 'int' })
  numberBedType1: number;

  @Column({ nullable: true, type: 'int' })
  numberBedType2: number;

  @Column({ type: 'int' })
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
