import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpToken } from '../database/entities/otp-token.entity/otp-token.entity';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([OtpToken]), EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
