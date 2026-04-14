import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AdminProfile } from '../database/entities/admin-profile.entity/admin-profile.entity';
import { Permission } from '../database/entities/permission.entity/permission.entity';
import { RolePermission } from '../database/entities/role-permission.entity/role-permission.entity';
import { Role } from '../database/entities/role.entity/role.entity';
import { UserRole } from '../database/entities/user-role.entity/user-role.entity';
import { User } from '../database/entities/user.entity/user.entity';
import { UsersService } from '../users/users.service';
import { AssignPermissionDto } from './dto/assign-permission.dto/assign-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto/assign-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto/create-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto/update-role.dto';

const BASE_PERMISSIONS = [
  'rbac:roles:read',
  'rbac:roles:write',
  'rbac:permissions:read',
  'rbac:permissions:write',
  'users:roles:write',
];

@Injectable()
export class RbacService implements OnModuleInit {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(AdminProfile)
    private readonly adminProfileRepo: Repository<AdminProfile>,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedPermissionsAndSuperAdmin();
  }

  findAllRoles() {
    return this.roleRepo.find({
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
      order: {
        name: 'ASC',
      },
    });
  }

  createRole(dto: CreateRoleDto) {
    const role = this.roleRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      isSystem: false,
    });
    return this.roleRepo.save(role);
  }

  async updateRole(roleId: string, dto: UpdateRoleDto) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.name = dto.name ?? role.name;
    role.description = dto.description ?? role.description;
    return this.roleRepo.save(role);
  }

  async deleteRole(roleId: string) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.roleRepo.remove(role);
    return { message: 'Role deleted' };
  }

  findAllPermissions() {
    return this.permissionRepo.find({ order: { action: 'ASC' } });
  }

  createPermission(dto: CreatePermissionDto) {
    const permission = this.permissionRepo.create({
      action: dto.action,
      description: dto.description ?? null,
    });
    return this.permissionRepo.save(permission);
  }

  async updatePermission(permissionId: string, dto: UpdatePermissionDto) {
    const permission = await this.permissionRepo.findOne({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    permission.action = dto.action ?? permission.action;
    permission.description = dto.description ?? permission.description;
    return this.permissionRepo.save(permission);
  }

  async deletePermission(permissionId: string) {
    const permission = await this.permissionRepo.findOne({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    await this.permissionRepo.remove(permission);
    return { message: 'Permission deleted' };
  }

  async assignPermissionToRole(roleId: string, dto: AssignPermissionDto) {
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const permission = await this.permissionRepo.findOne({
      where: { id: dto.permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const existing = await this.rolePermissionRepo.findOne({
      where: { roleId, permissionId: dto.permissionId },
    });

    if (!existing) {
      await this.rolePermissionRepo.save(
        this.rolePermissionRepo.create({ roleId, permissionId: dto.permissionId }),
      );
    }

    return { message: 'Permission assigned to role' };
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const existing = await this.rolePermissionRepo.findOne({
      where: { roleId, permissionId },
    });

    if (!existing) {
      throw new NotFoundException('Role-permission mapping not found');
    }

    await this.rolePermissionRepo.remove(existing);
    return { message: 'Permission removed from role' };
  }

  async assignRoleToUser(dto: AssignRoleDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepo.findOne({ where: { id: dto.roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const existing = await this.userRoleRepo.findOne({
      where: { userId: dto.userId, roleId: dto.roleId },
    });

    if (!existing) {
      await this.userRoleRepo.save(
        this.userRoleRepo.create({ userId: dto.userId, roleId: dto.roleId }),
      );
    }

    return { message: 'Role assigned to user' };
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const existing = await this.userRoleRepo.findOne({ where: { userId, roleId } });
    if (!existing) {
      throw new NotFoundException('User-role mapping not found');
    }

    await this.userRoleRepo.remove(existing);
    return { message: 'Role removed from user' };
  }

  private async seedPermissionsAndSuperAdmin(): Promise<void> {
    for (const action of BASE_PERMISSIONS) {
      await this.usersService.ensurePermission(action, `Seeded permission: ${action}`);
    }

    let superAdminRole = await this.usersService.findRoleByName('SUPER_ADMIN');
    if (!superAdminRole) {
      superAdminRole = await this.usersService.createRole(
        'SUPER_ADMIN',
        'System super administrator role',
        true,
      );
    }

    const permissions = await this.permissionRepo.find({
      where: BASE_PERMISSIONS.map((action) => ({ action })),
    });

    for (const permission of permissions) {
      await this.usersService.assignPermissionToRole(superAdminRole.id, permission.id);
    }

    const adminEmail =
      this.configService.get<string>('SUPER_ADMIN_EMAIL') ?? 'admin@example.com';
    const adminPassword =
      this.configService.get<string>('SUPER_ADMIN_PASSWORD') ?? 'Admin@12345';

    let adminUser = await this.userRepo.findOne({
      where: { email: adminEmail.toLowerCase() },
    });

    if (!adminUser) {
      adminUser = await this.userRepo.save(
        this.userRepo.create({
          email: adminEmail.toLowerCase(),
          passwordHash: await bcrypt.hash(adminPassword, 10),
          isActive: true,
          isEmailVerified: true,
        }),
      );

      await this.adminProfileRepo.save(
        this.adminProfileRepo.create({
          userId: adminUser.id,
          firstName: 'Super',
          lastName: 'Admin',
        }),
      );
    }

    const hasRole = await this.userRoleRepo.findOne({
      where: { userId: adminUser.id, roleId: superAdminRole.id },
    });

    if (!hasRole) {
      await this.userRoleRepo.save(
        this.userRoleRepo.create({
          userId: adminUser.id,
          roleId: superAdminRole.id,
        }),
      );
    }
  }
}
