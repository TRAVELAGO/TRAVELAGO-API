import { Booking } from '@modules/booking/booking.entity';
import { Feedback } from '@modules/feedback/feedback.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import { RoomType } from '@modules/room-type/room-type.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('json', {
    nullable: true,
  })
  images: string[];

  @Column()
  currentAvailable: number;

  @Column()
  total: number;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rate: number;

  @Column({ type: 'float', nullable: true })
  area: number;

  @Column('json', {
    nullable: true,
  })
  roomAmenities: number[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms, {
    eager: true,
  })
  roomType: RoomType;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotelId' })
  hotel: Hotel;

  @OneToMany(() => Feedback, (feedback) => feedback.room)
  feedbacks: Feedback[];

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
