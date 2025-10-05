import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, PrimaryButton, SecondaryButton, DangerButton, SuccessButton } from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('ca-button');
      expect(button).toHaveClass('ca-button--primary');
      expect(button).toHaveClass('ca-button--medium');
    });

    it('renders all variants correctly', () => {
      const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'ghost', 'outline'] as const;

      variants.forEach(variant => {
        const { unmount } = render(<Button variant={variant}>Test</Button>);
        const button = screen.getByRole('button', { name: /test/i });
        expect(button).toHaveClass(`ca-button--${variant}`);
        unmount();
      });
    });

    it('renders all sizes correctly', () => {
      const sizes = ['small', 'medium', 'large'] as const;

      sizes.forEach(size => {
        const { unmount } = render(<Button size={size}>Test</Button>);
        const button = screen.getByRole('button', { name: /test/i });
        expect(button).toHaveClass(`ca-button--${size}`);
        unmount();
      });
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Test</Button>);

      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('ca-button');
    });

    it('renders with left icon', () => {
      const icon = <span data-testid="left-icon">→</span>;
      render(<Button icon={icon}>Test</Button>);

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const iconRight = <span data-testid="right-icon">←</span>;
      render(<Button iconRight={iconRight}>Test</Button>);

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders full width when specified', () => {
      render(<Button fullWidth>Test</Button>);

      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toHaveClass('ca-button--full-width');
    });
  });

  describe('Loading State', () => {
    it('renders loading spinner when loading', () => {
      render(<Button loading>Test</Button>);

      const spinner = screen.getByLabelText(/loading/i);
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button loading>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('has aria-busy attribute when loading', () => {
      render(<Button loading>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('adds loading class when loading', () => {
      render(<Button loading>Test</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('ca-button--loading');
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Test</Button>);

      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toBeDisabled();
    });

    it('adds disabled class when disabled', () => {
      render(<Button disabled>Test</Button>);

      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toHaveClass('ca-button--disabled');
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button disabled onClick={handleClick}>Test</Button>);

      const button = screen.getByRole('button', { name: /test/i });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Test</Button>);

      const button = screen.getByRole('button', { name: /test/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Button loading onClick={handleClick}>Test</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Convenience Components', () => {
    it('PrimaryButton renders with primary variant', () => {
      render(<PrimaryButton>Primary</PrimaryButton>);

      const button = screen.getByRole('button', { name: /primary/i });
      expect(button).toHaveClass('ca-button--primary');
    });

    it('SecondaryButton renders with secondary variant', () => {
      render(<SecondaryButton>Secondary</SecondaryButton>);

      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toHaveClass('ca-button--secondary');
    });

    it('DangerButton renders with danger variant', () => {
      render(<DangerButton>Danger</DangerButton>);

      const button = screen.getByRole('button', { name: /danger/i });
      expect(button).toHaveClass('ca-button--danger');
    });

    it('SuccessButton renders with success variant', () => {
      render(<SuccessButton>Success</SuccessButton>);

      const button = screen.getByRole('button', { name: /success/i });
      expect(button).toHaveClass('ca-button--success');
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Test</Button>);

      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toBeInTheDocument();
    });

    it('supports custom aria attributes', () => {
      render(<Button aria-label="Custom label">Test</Button>);

      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Snapshot Testing', () => {
    it('matches snapshot for primary variant', () => {
      const { container } = render(<Button variant="primary">Primary Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for loading state', () => {
      const { container } = render(<Button loading>Loading Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
