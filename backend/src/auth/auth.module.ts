import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'; // Add this
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy'; // Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    PassportModule, // Add this
    JwtModule.register({ secret: 'default-secret', signOptions: { expiresIn: '1h' } }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: '"ExpressCart" <no-reply@expresscart.com>',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Add this
})
export class AuthModule {}
