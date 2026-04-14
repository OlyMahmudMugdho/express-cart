import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProfile } from '../database/entities/admin-profile.entity/admin-profile.entity';
import { Permission } from '../database/entities/permission.entity/permission.entity';
import { RolePermission } from '../database/entities/role-permission.entity/role-permission.entity';
import { Role } from '../database/entities/role.entity/role.entity';
import { UserRole } from '../database/entities/user-role.entity/user-role.entity';
import { User } from '../database/entities/user.entity/user.entity';
import { UsersModule } from '../users/users.module';
import { PermissionGuard } from './guards/permission.guard/permission.guard';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      UserRole,
      User,
      AdminProfile,
    ]),
  ],
  controllers: [RbacController],
  providers: [RbacService, PermissionGuard],
  exports: [RbacService, PermissionGuard],
})
export class RbacModule {}
