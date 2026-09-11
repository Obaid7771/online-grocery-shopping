import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        phone: string | null;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        updatedAt: Date;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    getAddresses(userId: string): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        recipientName: string;
        street: string;
        apartment: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number | null;
        longitude: number | null;
        isDefault: boolean;
        deliveryInstructions: string | null;
        userId: string;
    }[]>;
    getAddressById(userId: string, addressId: string): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        recipientName: string;
        street: string;
        apartment: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number | null;
        longitude: number | null;
        isDefault: boolean;
        deliveryInstructions: string | null;
        userId: string;
    }>;
    createAddress(userId: string, dto: CreateAddressDto): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        recipientName: string;
        street: string;
        apartment: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number | null;
        longitude: number | null;
        isDefault: boolean;
        deliveryInstructions: string | null;
        userId: string;
    }>;
    updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<{
        id: string;
        phone: string;
        createdAt: Date;
        updatedAt: Date;
        label: string;
        recipientName: string;
        street: string;
        apartment: string | null;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        latitude: number | null;
        longitude: number | null;
        isDefault: boolean;
        deliveryInstructions: string | null;
        userId: string;
    }>;
    deleteAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
    setDefaultAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
}
