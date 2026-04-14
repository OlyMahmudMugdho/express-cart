import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdminProfile } from './database/entities/admin-profile.entity/admin-profile.entity';
import { CustomerProfile } from './database/entities/customer-profile.entity/customer-profile.entity';
import { OtpToken } from './database/entities/otp-token.entity/otp-token.entity';
import { Permission } from './database/entities/permission.entity/permission.entity';
import { RolePermission } from './database/entities/role-permission.entity/role-permission.entity';
import { Role } from './database/entities/role.entity/role.entity';
import { UserRole } from './database/entities/user-role.entity/user-role.entity';
import { User } from './database/entities/user.entity/user.entity';
import { OtpModule } from './otp/otp.module';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: configService.get<number>('DB_PORT') ?? 5432,
        username: configService.get<string>('DB_USER') ?? 'postgres',
        password: configService.get<string>('DB_PASSWORD') ?? 'mysecretpassword',
        database: configService.get<string>('DB_NAME') ?? 'postgres',
        entities: [
          User,
          AdminProfile,
          CustomerProfile,
          Role,
          Permission,
          RolePermission,
          UserRole,
          OtpToken,
        ],
        synchronize: (configService.get<string>('DB_SYNC') ?? 'true') === 'true',
        logging: (configService.get<string>('DB_LOGGING') ?? 'false') === 'true',
      }),
    }),
    UsersModule,
    OtpModule,
    AuthModule,
    RbacModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
