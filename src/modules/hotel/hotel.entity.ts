import { HotelStatus } from '@constants/index';
import { City } from '@modules/city/city.entity';
import { Room } from '@modules/room/room.entity';
import { User } from '@modules/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  @Index({ fulltext: true })
  name: string;

  @Column('simple-array')
  images: string[];

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rate: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: HotelStatus.OPEN })
  status: HotelStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  latitude: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  longitude: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User)
  user: User;

  @ManyToOne(() => City, (city) => city.hotels)
  city: City;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];
}
