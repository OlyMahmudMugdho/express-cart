import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProfile } from '../database/entities/admin-profile.entity/admin-profile.entity';
import { CustomerProfile } from '../database/entities/customer-profile.entity/customer-profile.entity';
import { Permission } from '../database/entities/permission.entity/permission.entity';
import { RolePermission } from '../database/entities/role-permission.entity/role-permission.entity';
import { Role } from '../database/entities/role.entity/role.entity';
import { UserRole } from '../database/entities/user-role.entity/user-role.entity';
import { User } from '../database/entities/user.entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      CustomerProfile,
      AdminProfile,
      UserRole,
      Role,
      RolePermission,
      Permission,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
