import { render, screen } from '@testing-library/react';
import StatCard from '@/components/ui/StatCard';
import { DollarSign, Users, ShoppingCart, Package } from 'lucide-react';

describe('StatCard', () => {
  describe('rendering', () => {
    it('should render title correctly', () => {
      render(
        <StatCard
          title="Total Revenue"
          value="$45,680"
          icon={DollarSign}
        />
      );
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('should render value correctly', () => {
      render(
        <StatCard
          title="Total Orders"
          value={1250}
          icon={ShoppingCart}
        />
      );
      expect(screen.getByText('1250')).toBeInTheDocument();
    });

    it('should render string value correctly', () => {
      render(
        <StatCard
          title="Revenue"
          value="$45,680.50"
          icon={DollarSign}
        />
      );
      expect(screen.getByText('$45,680.50')).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(
        <StatCard
          title="Customers"
          value={890}
          icon={Users}
        />
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('change indicator', () => {
    it('should show positive change with up arrow', () => {
      render(
        <StatCard
          title="Orders"
          value={100}
          change={12.5}
          icon={ShoppingCart}
        />
      );
      expect(screen.getByText('12.5% vs last month')).toBeInTheDocument();
    });

    it('should show negative change with down arrow', () => {
      render(
        <StatCard
          title="Orders"
          value={100}
          change={-8.3}
          icon={ShoppingCart}
        />
      );
      expect(screen.getByText('8.3% vs last month')).toBeInTheDocument();
    });

    it('should not show change when not provided', () => {
      render(
        <StatCard
          title="Products"
          value={156}
          icon={Package}
        />
      );
      expect(screen.queryByText(/vs last month/)).not.toBeInTheDocument();
    });

    it('should treat zero change as positive', () => {
      const { container } = render(
        <StatCard
          title="Orders"
          value={100}
          change={0}
          icon={ShoppingCart}
        />
      );
      expect(screen.getByText('0% vs last month')).toBeInTheDocument();
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should apply green color for positive change', () => {
      const { container } = render(
        <StatCard
          title="Orders"
          value={100}
          change={15}
          icon={ShoppingCart}
        />
      );
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('should apply red color for negative change', () => {
      const { container } = render(
        <StatCard
          title="Orders"
          value={100}
          change={-10}
          icon={ShoppingCart}
        />
      );
      expect(container.querySelector('.text-red-500')).toBeInTheDocument();
    });
  });

  describe('custom styling', () => {
    it('should apply custom icon color', () => {
      const { container } = render(
        <StatCard
          title="Revenue"
          value={1000}
          icon={DollarSign}
          iconColor="text-green-600"
        />
      );
      const icon = container.querySelector('.text-green-600');
      expect(icon).toBeInTheDocument();
    });

    it('should apply custom icon background', () => {
      const { container } = render(
        <StatCard
          title="Revenue"
          value={1000}
          icon={DollarSign}
          iconBg="bg-green-50"
        />
      );
      const iconBg = container.querySelector('.bg-green-50');
      expect(iconBg).toBeInTheDocument();
    });
  });

  describe('common use cases', () => {
    it('should render revenue stat card', () => {
      render(
        <StatCard
          title="Total Revenue"
          value="$45,680.50"
          change={8.3}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
      );
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$45,680.50')).toBeInTheDocument();
      expect(screen.getByText('8.3% vs last month')).toBeInTheDocument();
    });

    it('should render orders stat card', () => {
      render(
        <StatCard
          title="Total Orders"
          value={1250}
          change={12.5}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
      );
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('1250')).toBeInTheDocument();
    });

    it('should render customers stat card', () => {
      render(
        <StatCard
          title="Total Customers"
          value={890}
          change={15.2}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      );
      expect(screen.getByText('Total Customers')).toBeInTheDocument();
      expect(screen.getByText('890')).toBeInTheDocument();
    });
  });
});
