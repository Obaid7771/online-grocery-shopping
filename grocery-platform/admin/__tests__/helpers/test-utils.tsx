import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// Add any providers needed for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  orderNumber: 'FC-20240101-0001',
  status: 'PENDING_PAYMENT',
  totalAmount: 59.99,
  subtotal: 50.0,
  deliveryFee: 4.99,
  taxAmount: 5.0,
  discountAmount: 0,
  createdAt: '2024-01-01T10:00:00Z',
  user: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  },
  items: [
    {
      id: 'item-1',
      productName: 'Organic Bananas',
      quantity: 2,
      unitPrice: 2.99,
      totalPrice: 5.98,
    },
  ],
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: 'product-1',
  name: 'Organic Bananas',
  slug: 'organic-bananas',
  sku: 'PROD-001',
  description: 'Fresh organic bananas',
  price: 2.99,
  discountPrice: null,
  stockQuantity: 100,
  minStockThreshold: 10,
  isFeatured: true,
  isActive: true,
  category: {
    id: 'cat-1',
    name: 'Fruits',
    slug: 'fruits',
  },
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/banana.jpg',
      isPrimary: true,
    },
  ],
  createdAt: '2024-01-01T10:00:00Z',
  ...overrides,
});

export const createMockCustomer = (overrides = {}) => ({
  id: 'customer-1',
  email: 'customer@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  phone: '+1234567890',
  isActive: true,
  isEmailVerified: true,
  createdAt: '2024-01-01T10:00:00Z',
  _count: {
    orders: 5,
  },
  ...overrides,
});

export const createMockCoupon = (overrides = {}) => ({
  id: 'coupon-1',
  code: 'SAVE20',
  description: '20% off your order',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  minOrderAmount: 50,
  maxDiscountAmount: 100,
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  usageLimitTotal: 1000,
  usageLimitPerUser: 1,
  timesUsed: 50,
  isActive: true,
  ...overrides,
});

export const createMockDashboardStats = () => ({
  totalOrders: 1250,
  totalRevenue: 45680.5,
  totalCustomers: 890,
  totalProducts: 156,
  ordersChange: 12.5,
  revenueChange: 8.3,
  customersChange: 15.2,
  productsChange: 5.1,
});

export const createMockRevenueData = () => [
  { date: '2024-01-01', revenue: 1200 },
  { date: '2024-01-02', revenue: 1450 },
  { date: '2024-01-03', revenue: 980 },
  { date: '2024-01-04', revenue: 1680 },
  { date: '2024-01-05', revenue: 1320 },
  { date: '2024-01-06', revenue: 1890 },
  { date: '2024-01-07', revenue: 2100 },
];
