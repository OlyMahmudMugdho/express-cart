import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.enum';
import { Address } from './entities/address.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
  ) {}

  // Admin CRUD (superadmin only)
  async createAdmin(email: string, password: string, role: Role = Role.ADMIN) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = this.userRepo.create({ email, password: hashedPassword, role, isVerified: true });
    return this.userRepo.save(admin);
  }

  async findAllAdmins() {
    return this.userRepo.find({ where: [{ role: Role.ADMIN }, { role: Role.SUPERADMIN }] });
  }

  async findAdminById(id: string) {
    const user = await this.userRepo.findOne({ where: { id, role: Role.ADMIN } });
    if (!user) throw new NotFoundException('Admin not found');
    return user;
  }

  async updateAdmin(id: string, data: Partial<User>) {
    const admin = await this.findAdminById(id);
    Object.assign(admin, data);
    return this.userRepo.save(admin);
  }

  async deleteAdmin(id: string) {
    const admin = await this.findAdminById(id);
    await this.userRepo.remove(admin);
    return { message: 'Admin deleted' };
  }

  // Customer management (admin/superadmin)
  async findAllCustomers() {
    return this.userRepo.find({ where: { role: Role.CUSTOMER } });
  }

  async findCustomerById(id: string) {
    const user = await this.userRepo.findOne({ where: { id, role: Role.CUSTOMER } });
    if (!user) throw new NotFoundException('Customer not found');
    return user;
  }

  async updateCustomer(id: string, data: Partial<User>) {
    const customer = await this.findCustomerById(id);
    Object.assign(customer, data);
    return this.userRepo.save(customer);
  }

  async deactivateCustomer(id: string) {
    const customer = await this.findCustomerById(id);
    customer.isActive = false;
    return this.userRepo.save(customer);
  }

  // Profile management
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: Partial<User>) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { role, isVerified, ...allowed } = data;
    Object.assign(user, allowed);
    return this.userRepo.save(user);
  }

  // Address management
  async addAddress(userId: string, addressData: Partial<Address>) {
    if (addressData.isDefault) {
      await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
    }
    const address = this.addressRepo.create({ ...addressData, userId });
    return this.addressRepo.save(address);
  }

  async getAddresses(userId: string) {
    return this.addressRepo.find({ where: { userId }, order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async updateAddress(userId: string, addressId: string, data: Partial<Address>) {
    const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');
    if (data.isDefault) {
      await this.addressRepo.update({ userId, isDefault: true }, { isDefault: false });
    }
    Object.assign(address, data);
    return this.addressRepo.save(address);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressRepo.findOne({ where: { id: addressId, userId } });
    if (!address) throw new NotFoundException('Address not found');
    await this.addressRepo.remove(address);
    return { message: 'Address deleted' };
  }
}
