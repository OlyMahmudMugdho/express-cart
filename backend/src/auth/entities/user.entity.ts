import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true })
  lockedUntil: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true, type: 'text', array: true })
  previousPasswords: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
