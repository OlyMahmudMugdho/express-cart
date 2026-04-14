import { IsEmail, IsEnum } from 'class-validator';
import { OtpPurpose } from '../../../database/entities/otp-token.entity/otp-token.entity';

export class OtpSendDto {
  @IsEmail()
  email: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}
