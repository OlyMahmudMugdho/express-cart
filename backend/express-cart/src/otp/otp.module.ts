import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpToken } from '../database/entities/otp-token.entity/otp-token.entity';
import { OtpService } from './otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([OtpToken])],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
