import { BookingDetail } from '@modules/booking-detail/booking-detail.entity';
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
} from 'typeorm';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discount: number;

  @Column('simple-array')
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

  @Column('simple-array')
  roomAmenities: number[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms)
  roomType: RoomType;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  hotel: Hotel;

  @OneToMany(() => Feedback, (feedback) => feedback.room)
  feedbacks: Feedback[];

  @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.room)
  bookingDetails: BookingDetail[];
}
