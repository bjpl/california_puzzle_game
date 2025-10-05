import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, RegionBadge, StatusBadge } from '@/components/ui/Badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Badge>Test Badge</Badge>);

      const badge = screen.getByText('Test Badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('ca-badge');
      expect(badge).toHaveClass('ca-badge--default');
      expect(badge).toHaveClass('ca-badge--medium');
    });

    it('renders all variants correctly', () => {
      const variants = ['default', 'primary', 'success', 'warning', 'danger', 'info', 'region'] as const;

      variants.forEach(variant => {
        const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
        const badge = screen.getByText(variant);
        expect(badge).toHaveClass(`ca-badge--${variant}`);
        unmount();
      });
    });

    it('renders all sizes correctly', () => {
      const sizes = ['small', 'medium', 'large'] as const;

      sizes.forEach(size => {
        const { unmount } = render(<Badge size={size}>{size}</Badge>);
        const badge = screen.getByText(size);
        expect(badge).toHaveClass(`ca-badge--${size}`);
        unmount();
      });
    });

    it('renders with custom className', () => {
      render(<Badge className="custom-class">Test</Badge>);

      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('ca-badge');
    });

    it('renders with rounded style by default', () => {
      render(<Badge>Test</Badge>);

      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('ca-badge--rounded');
    });

    it('renders without rounded style when specified', () => {
      render(<Badge rounded={false}>Test</Badge>);

      const badge = screen.getByText('Test');
      expect(badge).not.toHaveClass('ca-badge--rounded');
    });

    it('renders with dot indicator', () => {
      render(<Badge dot>Test</Badge>);

      const badge = screen.getByText('Test');
      const dot = badge.querySelector('.ca-badge__dot');
      expect(dot).toBeInTheDocument();
    });
  });

  describe('Region Mapping', () => {
    it('maps region names to color classes correctly', () => {
      const regions = [
        { name: 'bay-area', expected: 'ca-badge--region-bay-area' },
        { name: 'Bay Area', expected: 'ca-badge--region-bay-area' },
        { name: 'central-valley', expected: 'ca-badge--region-central-valley' },
        { name: 'gold-country', expected: 'ca-badge--region-gold-country' },
        { name: 'los-angeles', expected: 'ca-badge--region-los-angeles' },
        { name: 'north-coast', expected: 'ca-badge--region-north-coast' },
        { name: 'northern', expected: 'ca-badge--region-northern' },
        { name: 'orange-county', expected: 'ca-badge--region-orange-county' },
        { name: 'sacramento', expected: 'ca-badge--region-sacramento' },
        { name: 'san-diego', expected: 'ca-badge--region-san-diego' },
        { name: 'sierra', expected: 'ca-badge--region-sierra' },
        { name: 'southern-california', expected: 'ca-badge--region-southern-california' }
      ];

      regions.forEach(({ name, expected }) => {
        const { unmount } = render(<Badge region={name}>{name}</Badge>);
        const badge = screen.getByText(name);
        expect(badge).toHaveClass(expected);
        unmount();
      });
    });

    it('handles unknown regions gracefully', () => {
      render(<Badge region="unknown-region">Test</Badge>);

      const badge = screen.getByText('Test');
      expect(badge).toHaveClass('ca-badge--region-default');
    });
  });

  describe('Interactive Behavior', () => {
    it('renders as button when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>Clickable</Badge>);

      const badge = screen.getByRole('button', { name: /clickable/i });
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe('BUTTON');
    });

    it('renders as span when onClick is not provided', () => {
      render(<Badge>Not Clickable</Badge>);

      const badge = screen.getByText('Not Clickable');
      expect(badge.tagName).toBe('SPAN');
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Badge onClick={handleClick}>Click me</Badge>);

      const badge = screen.getByRole('button', { name: /click me/i });
      await user.click(badge);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has clickable class when onClick is provided', () => {
      render(<Badge onClick={vi.fn()}>Test</Badge>);

      const badge = screen.getByRole('button', { name: /test/i });
      expect(badge).toHaveClass('ca-badge--clickable');
    });
  });

  describe('RegionBadge Component', () => {
    it('renders with region variant', () => {
      render(<RegionBadge region="bay-area">Bay Area</RegionBadge>);

      const badge = screen.getByText('Bay Area');
      expect(badge).toHaveClass('ca-badge--region-bay-area');
    });

    it('requires region prop', () => {
      render(<RegionBadge region="sacramento">Sacramento</RegionBadge>);

      const badge = screen.getByText('Sacramento');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('StatusBadge Component', () => {
    it('renders stable status', () => {
      render(<StatusBadge status="stable" />);

      const badge = screen.getByText('Stable');
      expect(badge).toHaveClass('ca-badge--success');
      expect(badge).toHaveClass('ca-badge--small');
    });

    it('renders beta status', () => {
      render(<StatusBadge status="beta" />);

      const badge = screen.getByText('Beta');
      expect(badge).toHaveClass('ca-badge--warning');
    });

    it('renders new status', () => {
      render(<StatusBadge status="new" />);

      const badge = screen.getByText('New');
      expect(badge).toHaveClass('ca-badge--info');
    });

    it('renders deprecated status', () => {
      render(<StatusBadge status="deprecated" />);

      const badge = screen.getByText('Deprecated');
      expect(badge).toHaveClass('ca-badge--default');
    });

    it('allows custom children to override default text', () => {
      render(<StatusBadge status="stable">Custom Text</StatusBadge>);

      const badge = screen.getByText('Custom Text');
      expect(badge).toBeInTheDocument();
      expect(screen.queryByText('Stable')).not.toBeInTheDocument();
    });
  });

  describe('Snapshot Testing', () => {
    it('matches snapshot for default badge', () => {
      const { container } = render(<Badge>Default Badge</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for region badge', () => {
      const { container } = render(<Badge region="bay-area" dot>Bay Area</Badge>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
