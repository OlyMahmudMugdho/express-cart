import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { OtpPurpose } from '../../../database/entities/otp-token.entity/otp-token.entity';

export class OtpVerifyDto {
  @IsEmail()
  email: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;

  @IsString()
  @Length(6, 6)
  code: string;
}
