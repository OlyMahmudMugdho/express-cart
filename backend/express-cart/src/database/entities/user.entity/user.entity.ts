import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminProfile } from '../admin-profile.entity/admin-profile.entity';
import { CustomerProfile } from '../customer-profile.entity/customer-profile.entity';
import { OtpToken } from '../otp-token.entity/otp-token.entity';
import { UserRole } from '../user-role.entity/user-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @OneToOne(() => AdminProfile, (adminProfile) => adminProfile.user)
  adminProfile: AdminProfile | null;

  @OneToOne(() => CustomerProfile, (customerProfile) => customerProfile.user)
  customerProfile: CustomerProfile | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => OtpToken, (otpToken) => otpToken.user)
  otpTokens: OtpToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
