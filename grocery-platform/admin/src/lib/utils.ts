// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date));
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID:            'bg-blue-100 text-blue-800',
  CONFIRMED:       'bg-blue-200 text-blue-900',
  PREPARING:       'bg-purple-100 text-purple-800',
  READY_FOR_PICKUP:'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY:'bg-orange-100 text-orange-800',
  DELIVERED:       'bg-green-100 text-green-800',
  CANCELLED:       'bg-red-100 text-red-800',
  REFUNDED:        'bg-gray-100 text-gray-800',
};

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT:  ['CANCELLED'],
  PAID:             ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:        ['PREPARING', 'CANCELLED'],
  PREPARING:        ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'],
  READY_FOR_PICKUP: ['DELIVERED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED:        ['REFUNDED'],
  CANCELLED:        ['REFUNDED'],
  REFUNDED:         [],
};
