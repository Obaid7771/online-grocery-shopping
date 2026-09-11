// src/types/index.ts
// Shared TypeScript types matching backend Prisma schema

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string | null;
  parent?: Category;
  children?: Category[];
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  comparePrice?: number;
  unit: string;
  unitValue: number;
  imageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  category?: Category;
  categoryId: string;
  inventory?: { quantity: number; lowStockThreshold: number };
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  paymentMethod: string;
  paymentStatus: string;
  customer?: { id: string; firstName: string; lastName: string; email: string };
  items?: OrderItem[];
  deliveryAddress?: Record<string, unknown>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  role: string;
  _count?: { orders: number };
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  timesUsed: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt?: string;
  _count?: { usages: number };
}

export interface InventoryItem {
  id: string;
  product: { id: string; name: string; sku: string; imageUrls: string[] };
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  reorderPoint?: number;
  updatedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  postalCodes: string[];
  baseFee: number;
  minOrderAmount?: number;
  freeDeliveryThreshold?: number;
  estimatedMinutes: number;
  isActive: boolean;
  _count?: { orders: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliverySlot {
  id: string;
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  availableSlots: number;
  isActive: boolean;
  createdAt?: string;
}

export interface DashboardStats {
  revenue: { today: number; thisWeek: number; thisMonth: number; growth: number };
  orders: { total: number; pending: number; delivered: number; cancelled: number };
  customers: { total: number; newThisWeek: number };
  products: { total: number; lowStock: number; outOfStock: number };
}
