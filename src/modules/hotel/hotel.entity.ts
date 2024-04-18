import { HotelStatus } from '@constants/hotel-status';
import { City } from '@modules/city/city.entity';
import { FileObject } from '@modules/files/types/file-object';
import { Room } from '@modules/room/room.entity';
import { User } from '@modules/user/user.entity';
import { formatFileObjects, getFileObjects } from 'src/utils/files';
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
    transformer: {
      to(value: FileObject[]): string[] {
        return formatFileObjects(value);
      },
      from(value: string[]): FileObject[] {
        return getFileObjects(value);
      },
    },
  })
  images: FileObject[];

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

  @Column({ type: 'time' })
  checkInTime: string;

  @Column({ type: 'time' })
  checkOutTime: string;

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
