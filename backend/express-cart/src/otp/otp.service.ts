import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import {
  OtpPurpose,
  OtpToken,
} from '../database/entities/otp-token.entity/otp-token.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OtpToken)
    private readonly otpRepo: Repository<OtpToken>,
  ) {}

  async sendOtp(email: string, purpose: OtpPurpose, userId?: string): Promise<string> {
    const normalizedEmail = email.toLowerCase();

    await this.otpRepo.update(
      {
        email: normalizedEmail,
        purpose,
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      { consumedAt: new Date() },
    );

    const code = this.generateOtpCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const token = this.otpRepo.create({
      email: normalizedEmail,
      purpose,
      userId: userId ?? null,
      codeHash,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      consumedAt: null,
    });

    await this.otpRepo.save(token);
    return code;
  }

  async verifyOtpCode(
    email: string,
    purpose: OtpPurpose,
    code: string,
    consume = true,
  ): Promise<OtpToken> {
    const normalizedEmail = email.toLowerCase();

    const token = await this.otpRepo.findOne({
      where: {
        email: normalizedEmail,
        purpose,
        consumedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!token) {
      throw new NotFoundException('No active OTP token found');
    }

    if (token.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('OTP expired');
    }

    if (token.attempts >= token.maxAttempts) {
      throw new UnauthorizedException('OTP attempt limit reached');
    }

    const isMatch = await bcrypt.compare(code, token.codeHash);
    if (!isMatch) {
      await this.otpRepo.update(token.id, { attempts: token.attempts + 1 });
      throw new UnauthorizedException('Invalid OTP code');
    }

    if (consume) {
      await this.otpRepo.update(token.id, { consumedAt: new Date() });
      token.consumedAt = new Date();
    }

    return token;
  }

  async purgeExpiredTokens(): Promise<void> {
    await this.otpRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  private generateOtpCode(): string {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }
}
