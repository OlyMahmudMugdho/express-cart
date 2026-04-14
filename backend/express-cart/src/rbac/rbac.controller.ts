import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { Permissions } from './decorators/permissions.decorator/permissions.decorator';
import { AssignPermissionDto } from './dto/assign-permission.dto/assign-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto/assign-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto/create-permission.dto';
import { CreateRoleDto } from './dto/create-role.dto/create-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto/update-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto/update-role.dto';
import { PermissionGuard } from './guards/permission.guard/permission.guard';
import { RbacService } from './rbac.service';

@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @Permissions('rbac:roles:read')
  findAllRoles() {
    return this.rbacService.findAllRoles();
  }

  @Post('roles')
  @Permissions('rbac:roles:write')
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Patch('roles/:roleId')
  @Permissions('rbac:roles:write')
  updateRole(@Param('roleId') roleId: string, @Body() dto: UpdateRoleDto) {
    return this.rbacService.updateRole(roleId, dto);
  }

  @Delete('roles/:roleId')
  @Permissions('rbac:roles:write')
  deleteRole(@Param('roleId') roleId: string) {
    return this.rbacService.deleteRole(roleId);
  }

  @Post('roles/:roleId/permissions')
  @Permissions('rbac:permissions:write')
  assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionDto,
  ) {
    return this.rbacService.assignPermissionToRole(roleId, dto);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @Permissions('rbac:permissions:write')
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rbacService.removePermissionFromRole(roleId, permissionId);
  }

  @Get('permissions')
  @Permissions('rbac:permissions:read')
  findAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Post('permissions')
  @Permissions('rbac:permissions:write')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Patch('permissions/:permissionId')
  @Permissions('rbac:permissions:write')
  updatePermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.rbacService.updatePermission(permissionId, dto);
  }

  @Delete('permissions/:permissionId')
  @Permissions('rbac:permissions:write')
  deletePermission(@Param('permissionId') permissionId: string) {
    return this.rbacService.deletePermission(permissionId);
  }

  @Post('users/roles')
  @Permissions('users:roles:write')
  assignRoleToUser(@Body() dto: AssignRoleDto) {
    return this.rbacService.assignRoleToUser(dto);
  }

  @Delete('users/:userId/roles/:roleId')
  @Permissions('users:roles:write')
  removeRoleFromUser(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rbacService.removeRoleFromUser(userId, roleId);
  }
}
