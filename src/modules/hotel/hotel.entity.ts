import { HotelStatus } from '@constants/hotel-status';
import { City } from '@modules/city/city.entity';
import { Room } from '@modules/room/room.entity';
import { User } from '@modules/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  @Index({ fulltext: true })
  name: string;

  @Column('json', {
    nullable: true,
  })
  images: string[];

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rate: number;

  @Column({ nullable: true })
  address: string;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => City, (city) => city.hotels)
  city: City;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];
}
