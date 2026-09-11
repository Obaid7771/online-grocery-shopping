"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const argon2 = require("argon2");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                role: true,
                avatarUrl: true,
                isActive: true,
                isEmailVerified: true,
                isPhoneVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User profile not found');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                ...(dto.firstName && { firstName: dto.firstName }),
                ...(dto.lastName && { lastName: dto.lastName }),
                ...(dto.phone && { phone: dto.phone }),
                ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
            },
            select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                updatedAt: true,
            },
        });
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isMatch = await argon2.verify(user.passwordHash, dto.currentPassword);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Current password does not match');
        }
        const passwordHash = await argon2.hash(dto.newPassword, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true },
        });
        return { message: 'Password updated successfully. Please log in again.' };
    }
    async deleteAccount(userId) {
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    isActive: false,
                    deletedAt: new Date(),
                },
            }),
            this.prisma.refreshToken.updateMany({
                where: { userId },
                data: { revoked: true },
            }),
        ]);
        return { message: 'Account successfully deactivated and scheduled for deletion' };
    }
    async getAddresses(userId) {
        return this.prisma.address.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }
    async getAddressById(userId, addressId) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new common_1.NotFoundException('Address not found');
        }
        return address;
    }
    async createAddress(userId, dto) {
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const count = await this.prisma.address.count({ where: { userId } });
        const isDefault = count === 0 ? true : dto.isDefault ?? false;
        return this.prisma.address.create({
            data: {
                userId,
                ...dto,
                isDefault,
            },
        });
    }
    async updateAddress(userId, addressId, dto) {
        await this.getAddressById(userId, addressId);
        if (dto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        return this.prisma.address.update({
            where: { id: addressId },
            data: dto,
        });
    }
    async deleteAddress(userId, addressId) {
        await this.getAddressById(userId, addressId);
        await this.prisma.address.delete({
            where: { id: addressId },
        });
        return { message: 'Address deleted successfully' };
    }
    async setDefaultAddress(userId, addressId) {
        await this.getAddressById(userId, addressId);
        await this.prisma.$transaction([
            this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            }),
            this.prisma.address.update({
                where: { id: addressId },
                data: { isDefault: true },
            }),
        ]);
        return { message: 'Default address updated successfully' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map