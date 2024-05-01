import { RoleType } from '@constants/role-type';
import { UserStatus } from '@constants/user-status';
import { FileObject } from '@modules/files/types/file-object';
import { Exclude } from 'class-transformer';
import { formatFileObject, getFileObject } from 'src/utils/files';
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

  @Column({
    nullable: true,
    type: 'varchar',
    length: 1000,
    transformer: {
      to(value: FileObject): string {
        return formatFileObject(value);
      },
      from(value: string): FileObject {
        return getFileObject(value);
      },
    },
  })
  avatar: FileObject;

  @Column({ default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  @Exclude({ toPlainOnly: true })
  refreshToken: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
