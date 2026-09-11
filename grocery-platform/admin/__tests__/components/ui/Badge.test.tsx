import { render, screen } from '@testing-library/react';
import Badge from '@/components/ui/Badge';

describe('Badge', () => {
  describe('rendering', () => {
    it('should render label correctly', () => {
      render(<Badge label="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render as span element', () => {
      render(<Badge label="Test" />);
      const badge = screen.getByText('Test');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should have base styling classes', () => {
      render(<Badge label="Status" />);
      const badge = screen.getByText('Status');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'text-xs', 'font-medium');
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      render(<Badge label="Custom" className="bg-green-100 text-green-700" />);
      const badge = screen.getByText('Custom');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('should merge custom className with base styles', () => {
      render(<Badge label="Merged" className="bg-blue-100" />);
      const badge = screen.getByText('Merged');
      expect(badge).toHaveClass('rounded-full', 'bg-blue-100');
    });
  });

  describe('common use cases', () => {
    it('should render success status badge', () => {
      render(<Badge label="Active" className="bg-green-100 text-green-700" />);
      const badge = screen.getByText('Active');
      expect(badge).toHaveClass('bg-green-100', 'text-green-700');
    });

    it('should render warning status badge', () => {
      render(<Badge label="Pending" className="bg-yellow-100 text-yellow-700" />);
      const badge = screen.getByText('Pending');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-700');
    });

    it('should render danger status badge', () => {
      render(<Badge label="Cancelled" className="bg-red-100 text-red-700" />);
      const badge = screen.getByText('Cancelled');
      expect(badge).toHaveClass('bg-red-100', 'text-red-700');
    });

    it('should render info status badge', () => {
      render(<Badge label="Processing" className="bg-blue-100 text-blue-700" />);
      const badge = screen.getByText('Processing');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-700');
    });
  });

  describe('order status badges', () => {
    const orderStatusStyles = {
      'Pending Payment': 'bg-yellow-100 text-yellow-700',
      'Paid': 'bg-blue-100 text-blue-700',
      'Confirmed': 'bg-blue-100 text-blue-700',
      'Preparing': 'bg-orange-100 text-orange-700',
      'Out for Delivery': 'bg-indigo-100 text-indigo-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700',
    };

    Object.entries(orderStatusStyles).forEach(([status, className]) => {
      it(`should render ${status} badge correctly`, () => {
        render(<Badge label={status} className={className} />);
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });
  });

  describe('product status badges', () => {
    it('should render active badge', () => {
      render(<Badge label="Active" className="bg-green-100 text-green-700" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render inactive badge', () => {
      render(<Badge label="Inactive" className="bg-gray-100 text-gray-700" />);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('should render low stock badge', () => {
      render(<Badge label="Low Stock" className="bg-yellow-100 text-yellow-700" />);
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
    });

    it('should render out of stock badge', () => {
      render(<Badge label="Out of Stock" className="bg-red-100 text-red-700" />);
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });
  });
});
