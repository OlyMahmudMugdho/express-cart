import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Profile
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  // Addresses
  @Post('addresses')
  addAddress(@Request() req: any, @Body() body: any) {
    return this.usersService.addAddress(req.user.id, body);
  }

  @Get('addresses')
  getAddresses(@Request() req: any) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Patch('addresses/:id')
  updateAddress(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateAddress(req.user.id, id, body);
  }

  @Delete('addresses/:id')
  deleteAddress(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.deleteAddress(req.user.id, id);
  }

  // Admin management (superadmin only)
  @Post('admins')
  @Roles(Role.SUPERADMIN)
  createAdmin(@Body() body: { email: string; password: string; role?: Role }) {
    return this.usersService.createAdmin(body.email, body.password, body.role);
  }

  @Get('admins')
  @Roles(Role.SUPERADMIN)
  findAllAdmins() {
    return this.usersService.findAllAdmins();
  }

  @Get('admins/:id')
  @Roles(Role.SUPERADMIN)
  findAdminById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findAdminById(id);
  }

  @Patch('admins/:id')
  @Roles(Role.SUPERADMIN)
  updateAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateAdmin(id, body);
  }

  @Delete('admins/:id')
  @Roles(Role.SUPERADMIN)
  deleteAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteAdmin(id);
  }

  // Customer management (admin/superadmin)
  @Get('customers')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  findAllCustomers() {
    return this.usersService.findAllCustomers();
  }

  @Get('customers/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  findCustomerById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findCustomerById(id);
  }

  @Patch('customers/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  updateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateCustomer(id, body);
  }

  @Delete('customers/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  deactivateCustomer(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deactivateCustomer(id);
  }
}
