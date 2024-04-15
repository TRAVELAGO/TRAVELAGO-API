import { RoleType } from '@constants/role-type';
import { UserStatus } from '@constants/user-status';
import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 100 })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ length: 100 })
  fullName: string;

  @Column({ nullable: true })
  address: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ default: RoleType.USER })
  role: RoleType;

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column({ default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  accessToken: string;

  @Column({ nullable: true })
  codeOtp: string;
}
