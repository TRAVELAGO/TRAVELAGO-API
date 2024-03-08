import { RoleType, UserStatus } from '@constants/index';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 40 })
  username: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: RoleType.USER })
  role: RoleType;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column({ default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column()
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
