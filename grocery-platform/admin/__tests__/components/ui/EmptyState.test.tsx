import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '@/components/ui/EmptyState';
import { Package, ShoppingCart, Users, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';

describe('EmptyState', () => {
  describe('rendering', () => {
    it('should render title', () => {
      render(<EmptyState icon={Package} title="No Products" />);
      expect(screen.getByText('No Products')).toBeInTheDocument();
    });

    it('should render icon', () => {
      const { container } = render(<EmptyState icon={ShoppingCart} title="Empty Cart" />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <EmptyState
          icon={Package}
          title="No Products"
          description="Add your first product to get started."
        />
      );
      expect(screen.getByText('Add your first product to get started.')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      render(<EmptyState icon={Package} title="No Products" />);
      // Only title should be present, no description paragraph
      expect(screen.queryByText(/Add your first/)).not.toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('should render action when provided', () => {
      render(
        <EmptyState
          icon={Package}
          title="No Products"
          action={<Button>Add Product</Button>}
        />
      );
      expect(screen.getByRole('button', { name: 'Add Product' })).toBeInTheDocument();
    });

    it('should not render action when not provided', () => {
      render(<EmptyState icon={Package} title="No Products" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should call onClick when action button is clicked', () => {
      const handleClick = jest.fn();
      render(
        <EmptyState
          icon={Package}
          title="No Products"
          action={<Button onClick={handleClick}>Add Product</Button>}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add Product' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('layout and styling', () => {
    it('should center content', () => {
      const { container } = render(<EmptyState icon={Package} title="Empty" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should have vertical padding', () => {
      const { container } = render(<EmptyState icon={Package} title="Empty" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('py-16');
    });

    it('should center text', () => {
      const { container } = render(<EmptyState icon={Package} title="Empty" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('text-center');
    });

    it('should have icon container with gray background', () => {
      const { container } = render(<EmptyState icon={Package} title="Empty" />);
      const iconContainer = container.querySelector('.bg-gray-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('common use cases', () => {
    it('should render empty products state', () => {
      render(
        <EmptyState
          icon={Package}
          title="No Products"
          description="You haven't added any products yet."
          action={<Button>Add First Product</Button>}
        />
      );
      expect(screen.getByText('No Products')).toBeInTheDocument();
      expect(screen.getByText("You haven't added any products yet.")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add First Product' })).toBeInTheDocument();
    });

    it('should render empty orders state', () => {
      render(
        <EmptyState
          icon={ShoppingCart}
          title="No Orders"
          description="No orders have been placed yet."
        />
      );
      expect(screen.getByText('No Orders')).toBeInTheDocument();
      expect(screen.getByText('No orders have been placed yet.')).toBeInTheDocument();
    });

    it('should render empty customers state', () => {
      render(
        <EmptyState
          icon={Users}
          title="No Customers"
          description="You don't have any customers yet."
        />
      );
      expect(screen.getByText('No Customers')).toBeInTheDocument();
    });

    it('should render empty search results state', () => {
      render(
        <EmptyState
          icon={FileText}
          title="No Results Found"
          description="Try adjusting your search or filters."
        />
      );
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
    });
  });

  describe('different icons', () => {
    const icons = [
      { Icon: Package, name: 'Package' },
      { Icon: ShoppingCart, name: 'ShoppingCart' },
      { Icon: Users, name: 'Users' },
      { Icon: FileText, name: 'FileText' },
    ];

    icons.forEach(({ Icon, name }) => {
      it(`should render with ${name} icon`, () => {
        const { container } = render(<EmptyState icon={Icon} title={`Empty ${name}`} />);
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });
  });
});
