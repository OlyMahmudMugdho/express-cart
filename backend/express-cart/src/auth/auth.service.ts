import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OtpPurpose } from '../database/entities/otp-token.entity/otp-token.entity';
import { OtpService } from '../otp/otp.service';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { OtpSendDto } from './dto/otp-send.dto/otp-send.dto';
import { OtpVerifyDto } from './dto/otp-verify.dto/otp-verify.dto';
import { RefreshDto } from './dto/refresh.dto/refresh.dto';
import { RegisterDto } from './dto/register.dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';
import { JwtAccessPayload } from './strategies/jwt.strategy/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser(
      dto.email,
      passwordHash,
      dto.firstName,
      dto.lastName,
      dto.createAdminProfile ?? false,
    );

    const otpCode = await this.otpService.sendOtp(
      user.email,
      OtpPurpose.SIGNUP_VERIFICATION,
      user.id,
    );

    return {
      userId: user.id,
      email: user.email,
      otpPurpose: OtpPurpose.SIGNUP_VERIFICATION,
      otpCode,
      message: 'Registration successful. Verify email using OTP.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findWithAccessByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email is not verified');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    await this.usersService.setRefreshTokenHash(
      user.id,
      await bcrypt.hash(tokens.refreshToken, 10),
    );

    return tokens;
  }

  async refresh(dto: RefreshDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.usersService.findWithAccessById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!user.refreshTokenHash) {
      // No refresh token stored for this user
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      dto.refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenValid) {
      // Refresh token failed to match stored hash — possible token reuse/compromise.
      // Clear stored refresh token to revoke any existing session and force full re-authentication.
      await this.usersService.clearRefreshToken(user.id);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // Rotate refresh token on successful use
    const tokens = await this.issueTokens(user.id, user.email);
    await this.usersService.setRefreshTokenHash(
      user.id,
      await bcrypt.hash(tokens.refreshToken, 10),
    );

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async sendOtp(dto: OtpSendDto) {
    const otpCode = await this.otpService.sendOtp(dto.email, dto.purpose);
    return {
      email: dto.email.toLowerCase(),
      purpose: dto.purpose,
      otpCode,
      message: 'OTP sent',
    };
  }

  async verifyOtp(dto: OtpVerifyDto) {
    const token = await this.otpService.verifyOtpCode(
      dto.email,
      dto.purpose,
      dto.code,
      true,
    );

    if (dto.purpose === OtpPurpose.SIGNUP_VERIFICATION && token.userId) {
      await this.usersService.markEmailVerified(token.userId);
    }

    return {
      email: dto.email.toLowerCase(),
      purpose: dto.purpose,
      verified: true,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If this email exists, OTP has been sent' };
    }

    const otpCode = await this.otpService.sendOtp(
      user.email,
      OtpPurpose.PASSWORD_RESET,
      user.id,
    );

    return {
      message: 'Password reset OTP generated',
      otpCode,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.otpService.verifyOtpCode(
      dto.email,
      OtpPurpose.PASSWORD_RESET,
      dto.code,
      true,
    );

    if (!token.userId) {
      throw new BadRequestException('Invalid reset request context');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePasswordHash(token.userId, passwordHash);

    return { message: 'Password reset successful' };
  }

  private async issueTokens(userId: string, email: string) {
    const user = await this.usersService.findWithAccessById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = await this.usersService.flattenRoles(user);
    const permissions = await this.usersService.flattenPermissions(user);

    const payload: JwtAccessPayload = {
      sub: user.id,
      email,
      roles,
      permissions,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ??
        'dev_access_secret_change_me',
      expiresIn: (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ??
        '15m') as never,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, email },
      {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'dev_refresh_secret_change_me',
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
          '7d') as never,
      },
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<{ sub: string }> {
    try {
      return await this.jwtService.verifyAsync(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'dev_refresh_secret_change_me',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
