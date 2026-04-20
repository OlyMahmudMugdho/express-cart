import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { Role } from './entities/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(email: string, password: string, firstName?: string, lastName?: string, phone?: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      role: Role.CUSTOMER,
      firstName,
      lastName,
      phone,
    });
    await this.userRepo.save(user);

    await this.generateOtp(user.id, 'verification');
    return { message: 'Registration successful. Please verify your email.', userId: user.id };
  }

  async verifyOtp(userId: string, code: string, type: 'verification' | 'password_reset' | 'email_change') {
    const otp = await this.otpRepo.findOne({
      where: { userId, type, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (!otp || otp.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (otp.attempts >= 5) {
      throw new UnauthorizedException('Too many attempts. Please request a new OTP');
    }

    otp.attempts++;
    await this.otpRepo.save(otp);

    if (otp.code !== code) {
      throw new UnauthorizedException('Invalid OTP');
    }

    otp.isUsed = true;
    await this.otpRepo.save(otp);

    if (type === 'verification') {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.isVerified = true;
      await this.userRepo.save(user);
    }

    return { message: 'OTP verified successfully' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account locked. Try again later');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      user.failedLoginAttempts++;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.userRepo.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null as any;
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async logout(userId: string) {
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      await this.generateOtp(user.id, 'password_reset');
    }
    return { message: 'If email exists, OTP has been sent' };
  }

  async resetPassword(userId: string, code: string, newPassword: string) {
    await this.verifyOtp(userId, code, 'password_reset');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHistory = user.previousPasswords || [];

    for (const oldPassword of passwordHistory) {
      if (await bcrypt.compare(newPassword, oldPassword)) {
        throw new BadRequestException('Cannot reuse any of the last 3 passwords');
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.previousPasswords = [...passwordHistory.slice(-2), user.password];
    await this.userRepo.save(user);

    return { message: 'Password reset successfully' };
  }

  private async generateOtp(userId: string, type: 'verification' | 'password_reset' | 'email_change') {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otp = this.otpRepo.create({ code, type, expiresAt, userId });
    await this.otpRepo.save(otp);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (user) {
        await this.mailerService.sendMail({
          to: user.email,
          subject: 'Your ExpressCart OTP',
          text: `Your OTP code is ${code}. It expires in 10 minutes.`,
        });
    }
    
    return otp;
  }

  async getUserById(userId: string) {
    return this.userRepo.findOne({ where: { id: userId } });
  }
}
