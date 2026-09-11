import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/ui/Input';

describe('Input', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render label when provided', () => {
      render(<Input label="Email" id="email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should associate label with input via id', () => {
      render(<Input label="Username" id="username" />);
      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('for', 'username');
    });

    it('should not render label when not provided', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should apply error styles when error is present', () => {
      render(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-400');
    });

    it('should have red ring focus when error exists', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-red-400');
    });
  });

  describe('helper text', () => {
    it('should display helper text when provided', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });

    it('should not display helper text when error is present', () => {
      render(<Input helperText="Helper text" error="Error message" />);
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should have gray styling for helper text', () => {
      render(<Input helperText="Some help" />);
      const helperText = screen.getByText('Some help');
      expect(helperText).toHaveClass('text-gray-500');
    });
  });

  describe('user interaction', () => {
    it('should update value on user input', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Type here" />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('should call onChange handler', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle blur event', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('attributes', () => {
    it('should apply placeholder', () => {
      render(<Input placeholder="Enter email" />);
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('should apply disabled state', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should apply readOnly state', () => {
      render(<Input readOnly value="Read only text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should apply custom type', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should apply maxLength', () => {
      render(<Input maxLength={50} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '50');
    });
  });

  describe('custom styling', () => {
    it('should apply custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('should merge custom className with default styles', () => {
      render(<Input className="bg-gray-50" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'bg-gray-50');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref to input element', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should allow focus via ref', () => {
      const ref = { current: null as HTMLInputElement | null };
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toBe(document.activeElement);
    });
  });
});
