import {
  cn,
  formatCurrency,
  formatDate,
  formatDateShort,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_TRANSITIONS,
} from '@/lib/utils';

describe('cn (className utility)', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'included', false && 'excluded')).toBe('base included');
  });

  it('should handle undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('should handle array of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('should handle object notation', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('should return empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});

describe('formatCurrency', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(10)).toBe('$10.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle large amounts', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });

  it('should handle decimal amounts', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
    expect(formatCurrency(0.5)).toBe('$0.50');
  });

  it('should support different currencies', () => {
    expect(formatCurrency(10, 'EUR')).toContain('10');
    expect(formatCurrency(10, 'GBP')).toContain('10');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });
});

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const result = formatDate('2024-06-15T10:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('should format Date object correctly', () => {
    const date = new Date('2024-12-25T14:00:00Z');
    const result = formatDate(date);
    expect(result).toContain('Dec');
    expect(result).toContain('25');
    expect(result).toContain('2024');
  });

  it('should include time', () => {
    const result = formatDate('2024-01-01T15:30:00Z');
    // Should contain hour and minute
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatDateShort', () => {
  it('should format date string without time', () => {
    const result = formatDateShort('2024-06-15T10:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
    // Should NOT contain colon (time separator)
    expect(result).not.toContain(':');
  });

  it('should format Date object correctly', () => {
    const date = new Date('2024-03-20');
    const result = formatDateShort(date);
    expect(result).toContain('Mar');
    expect(result).toContain('20');
    expect(result).toContain('2024');
  });
});

describe('ORDER_STATUS_COLORS', () => {
  const expectedStatuses = [
    'PENDING_PAYMENT',
    'PAID',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ];

  it('should have colors for all order statuses', () => {
    expectedStatuses.forEach((status) => {
      expect(ORDER_STATUS_COLORS[status]).toBeDefined();
    });
  });

  it('should have yellow color for PENDING_PAYMENT', () => {
    expect(ORDER_STATUS_COLORS.PENDING_PAYMENT).toContain('yellow');
  });

  it('should have blue color for PAID', () => {
    expect(ORDER_STATUS_COLORS.PAID).toContain('blue');
  });

  it('should have green color for DELIVERED', () => {
    expect(ORDER_STATUS_COLORS.DELIVERED).toContain('green');
  });

  it('should have red color for CANCELLED', () => {
    expect(ORDER_STATUS_COLORS.CANCELLED).toContain('red');
  });

  it('should have gray color for REFUNDED', () => {
    expect(ORDER_STATUS_COLORS.REFUNDED).toContain('gray');
  });
});

describe('ORDER_STATUS_TRANSITIONS', () => {
  it('should allow PENDING_PAYMENT to be cancelled', () => {
    expect(ORDER_STATUS_TRANSITIONS.PENDING_PAYMENT).toContain('CANCELLED');
  });

  it('should allow PAID to transition to CONFIRMED or CANCELLED', () => {
    expect(ORDER_STATUS_TRANSITIONS.PAID).toContain('CONFIRMED');
    expect(ORDER_STATUS_TRANSITIONS.PAID).toContain('CANCELLED');
  });

  it('should allow CONFIRMED to transition to PREPARING', () => {
    expect(ORDER_STATUS_TRANSITIONS.CONFIRMED).toContain('PREPARING');
  });

  it('should allow PREPARING to transition to delivery states', () => {
    expect(ORDER_STATUS_TRANSITIONS.PREPARING).toContain('READY_FOR_PICKUP');
    expect(ORDER_STATUS_TRANSITIONS.PREPARING).toContain('OUT_FOR_DELIVERY');
  });

  it('should allow OUT_FOR_DELIVERY to transition to DELIVERED', () => {
    expect(ORDER_STATUS_TRANSITIONS.OUT_FOR_DELIVERY).toContain('DELIVERED');
  });

  it('should allow DELIVERED to be refunded', () => {
    expect(ORDER_STATUS_TRANSITIONS.DELIVERED).toContain('REFUNDED');
  });

  it('should not allow any transitions from REFUNDED', () => {
    expect(ORDER_STATUS_TRANSITIONS.REFUNDED).toHaveLength(0);
  });

  it('should not allow backwards transitions', () => {
    // DELIVERED cannot go back to PREPARING
    expect(ORDER_STATUS_TRANSITIONS.DELIVERED).not.toContain('PREPARING');
    // CONFIRMED cannot go back to PAID
    expect(ORDER_STATUS_TRANSITIONS.CONFIRMED).not.toContain('PAID');
  });

  describe('valid transition paths', () => {
    const validPaths = [
      ['PENDING_PAYMENT', 'CANCELLED'],
      ['PAID', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'],
      ['PAID', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERED'],
      ['PAID', 'CANCELLED'],
    ];

    validPaths.forEach((path) => {
      it(`should allow path: ${path.join(' -> ')}`, () => {
        for (let i = 0; i < path.length - 1; i++) {
          const from = path[i];
          const to = path[i + 1];
          expect(ORDER_STATUS_TRANSITIONS[from]).toContain(to);
        }
      });
    });
  });
});
