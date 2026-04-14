import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminProfile } from '../database/entities/admin-profile.entity/admin-profile.entity';
import { CustomerProfile } from '../database/entities/customer-profile.entity/customer-profile.entity';
import { Permission } from '../database/entities/permission.entity/permission.entity';
import { Role } from '../database/entities/role.entity/role.entity';
import { RolePermission } from '../database/entities/role-permission.entity/role-permission.entity';
import { UserRole } from '../database/entities/user-role.entity/user-role.entity';
import { User } from '../database/entities/user.entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(CustomerProfile)
    private readonly customerProfileRepo: Repository<CustomerProfile>,
    @InjectRepository(AdminProfile)
    private readonly adminProfileRepo: Repository<AdminProfile>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  findWithAccessByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
      relations: {
        userRoles: {
          role: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      },
    });
  }

  findWithAccessById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({
      where: { id },
      relations: {
        userRoles: {
          role: {
            rolePermissions: {
              permission: true,
            },
          },
        },
      },
    });
  }

  async createUser(
    email: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    createAdminProfile = false,
  ): Promise<User> {
    const user = this.usersRepo.create({
      email: email.toLowerCase(),
      passwordHash,
      isActive: true,
      isEmailVerified: false,
    });

    const saved = await this.usersRepo.save(user);

    if (createAdminProfile) {
      await this.adminProfileRepo.save(
        this.adminProfileRepo.create({
          userId: saved.id,
          firstName,
          lastName,
        }),
      );
    } else {
      await this.customerProfileRepo.save(
        this.customerProfileRepo.create({
          userId: saved.id,
          firstName,
          lastName,
        }),
      );
    }

    return saved;
  }

  async setRefreshTokenHash(userId: string, refreshTokenHash: string): Promise<void> {
    await this.usersRepo.update(userId, { refreshTokenHash });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersRepo.update(userId, { refreshTokenHash: null });
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.usersRepo.update(userId, { isEmailVerified: true });
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepo.update(userId, { passwordHash, refreshTokenHash: null });
  }

  async flattenPermissions(user: User): Promise<string[]> {
    const actions = new Set<string>();

    for (const userRole of user.userRoles ?? []) {
      for (const rolePermission of userRole.role?.rolePermissions ?? []) {
        if (rolePermission.permission?.action) {
          actions.add(rolePermission.permission.action);
        }
      }
    }

    return Array.from(actions).sort();
  }

  async flattenRoles(user: User): Promise<string[]> {
    return Array.from(
      new Set((user.userRoles ?? []).map((userRole) => userRole.role?.name).filter(Boolean)),
    ) as string[];
  }

  async ensureRoleAssignment(userId: string, roleId: string): Promise<void> {
    const existing = await this.userRoleRepo.findOne({ where: { userId, roleId } });
    if (existing) {
      return;
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.userRoleRepo.save(this.userRoleRepo.create({ userId, roleId }));
  }

  async createRole(name: string, description?: string, isSystem = false): Promise<Role> {
    const role = this.roleRepo.create({ name, description: description ?? null, isSystem });
    return this.roleRepo.save(role);
  }

  findRoleByName(name: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { name } });
  }

  async ensurePermission(action: string, description?: string): Promise<Permission> {
    const existing = await this.permissionRepo.findOne({ where: { action } });
    if (existing) {
      return existing;
    }

    return this.permissionRepo.save(
      this.permissionRepo.create({ action, description: description ?? null }),
    );
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const existing = await this.rolePermissionRepo.findOne({ where: { roleId, permissionId } });
    if (existing) {
      return;
    }

    await this.rolePermissionRepo.save(
      this.rolePermissionRepo.create({ roleId, permissionId }),
    );
  }
}
