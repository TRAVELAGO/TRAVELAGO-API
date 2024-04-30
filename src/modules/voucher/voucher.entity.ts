import { VoucherType } from '@constants/voucher-type';
import { Hotel } from '@modules/hotel/hotel.entity';
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
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'int', nullable: true })
  minimumAmount: number;

  @Column({ type: 'int', nullable: true })
  discountPercentage: number;

  @Column({ type: 'int' })
  maximumDiscount: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column()
  type: VoucherType;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  expiredDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => Hotel)
  hotel: Hotel;
}
