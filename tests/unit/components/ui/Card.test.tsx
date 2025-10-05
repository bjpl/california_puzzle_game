import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CountyCard } from '@/components/ui/Card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Card>Test content</Card>);

      const card = screen.getByText('Test content');
      expect(card).toBeInTheDocument();
    });

    it('renders all variants correctly', () => {
      const variants = ['default', 'elevated', 'outlined', 'interactive'] as const;

      variants.forEach(variant => {
        const { unmount } = render(<Card variant={variant}>{variant}</Card>);
        const card = screen.getByText(variant).closest('.ca-card');
        expect(card).toHaveClass(`ca-card--${variant}`);
        unmount();
      });
    });

    it('renders with title', () => {
      render(<Card title="Test Title">Content</Card>);

      expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument();
    });

    it('renders with subtitle', () => {
      render(<Card title="Title" subtitle="Subtitle">Content</Card>);

      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(<Card description="Test description">Content</Card>);

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Card className="custom-class">Content</Card>);

      const card = screen.getByText('Content').closest('.ca-card');
      expect(card).toHaveClass('custom-class');
    });

    it('renders with region class', () => {
      render(<Card region="bay-area">Content</Card>);

      const card = screen.getByText('Content').closest('.ca-card');
      expect(card).toHaveClass('ca-card--region-bay-area');
    });
  });

  describe('Media and Header', () => {
    it('renders media content', () => {
      const media = <img src="test.jpg" alt="Test" />;
      render(<Card media={media}>Content</Card>);

      expect(screen.getByAltText('Test')).toBeInTheDocument();
    });

    it('renders custom header', () => {
      const header = <div>Custom Header</div>;
      render(<Card header={header}>Content</Card>);

      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('renders default header with title and subtitle', () => {
      render(<Card title="Title" subtitle="Subtitle">Content</Card>);

      const header = screen.getByRole('heading', { name: /title/i }).closest('.ca-card__header');
      expect(header).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    it('renders region badge in header when region is provided', () => {
      render(<Card title="Title" region="bay-area">Content</Card>);

      expect(screen.getByText('Bay Area')).toBeInTheDocument();
    });
  });

  describe('Footer and Metadata', () => {
    it('renders footer content', () => {
      const footer = <div>Footer content</div>;
      render(<Card footer={footer}>Content</Card>);

      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders metadata items', () => {
      const metadata = [
        { label: 'Population', value: '873,965' },
        { label: 'Founded', value: 1850 }
      ];

      render(<Card metadata={metadata}>Content</Card>);

      expect(screen.getByText('Population')).toBeInTheDocument();
      expect(screen.getByText('873,965')).toBeInTheDocument();
      expect(screen.getByText('Founded')).toBeInTheDocument();
      expect(screen.getByText('1850')).toBeInTheDocument();
    });

    it('renders empty metadata gracefully', () => {
      render(<Card metadata={[]}>Content</Card>);

      const card = screen.getByText('Content').closest('.ca-card');
      expect(card?.querySelector('.ca-card__metadata')).not.toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('renders as article when onClick is provided', () => {
      const handleClick = vi.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);

      const card = screen.getByRole('button', { name: /clickable card/i });
      expect(card.tagName).toBe('ARTICLE');
    });

    it('renders as div when onClick is not provided', () => {
      render(<Card>Not Clickable</Card>);

      const card = screen.getByText('Not Clickable').closest('.ca-card');
      expect(card?.tagName).toBe('DIV');
    });

    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<Card onClick={handleClick}>Click me</Card>);

      const card = screen.getByRole('button', { name: /click me/i });
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has clickable class when onClick is provided', () => {
      render(<Card onClick={vi.fn()}>Test</Card>);

      const card = screen.getByRole('button', { name: /test/i });
      expect(card).toHaveClass('ca-card--clickable');
    });

    it('has tabIndex when onClick is provided', () => {
      render(<Card onClick={vi.fn()}>Test</Card>);

      const card = screen.getByRole('button', { name: /test/i });
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('CountyCard Component', () => {
    it('renders with name and region', () => {
      render(<CountyCard name="San Francisco" region="bay-area" />);

      expect(screen.getByRole('heading', { name: /san francisco/i })).toBeInTheDocument();
    });

    it('renders population metadata', () => {
      render(<CountyCard name="San Francisco" region="bay-area" population={873965} />);

      expect(screen.getByText('Population')).toBeInTheDocument();
      expect(screen.getByText('873,965')).toBeInTheDocument();
    });

    it('renders founded year metadata', () => {
      render(<CountyCard name="San Francisco" region="bay-area" founded={1850} />);

      expect(screen.getByText('Founded')).toBeInTheDocument();
      expect(screen.getByText('1850')).toBeInTheDocument();
    });

    it('renders area metadata', () => {
      render(<CountyCard name="San Francisco" region="bay-area" area={231} />);

      expect(screen.getByText('Area')).toBeInTheDocument();
      expect(screen.getByText('231 sq mi')).toBeInTheDocument();
    });

    it('renders county seat metadata', () => {
      render(<CountyCard name="San Francisco" region="bay-area" seat="San Francisco" />);

      expect(screen.getByText('County Seat')).toBeInTheDocument();
      expect(screen.getByText('San Francisco')).toBeInTheDocument();
    });

    it('renders with selected variant when selected', () => {
      render(<CountyCard name="San Francisco" region="bay-area" selected />);

      const card = screen.getByRole('heading', { name: /san francisco/i }).closest('.ca-card');
      expect(card).toHaveClass('ca-card--elevated');
      expect(card).toHaveClass('ca-county-card--selected');
    });

    it('renders with interactive variant when highlighted', () => {
      render(<CountyCard name="San Francisco" region="bay-area" highlighted />);

      const card = screen.getByRole('heading', { name: /san francisco/i }).closest('.ca-card');
      expect(card).toHaveClass('ca-card--interactive');
      expect(card).toHaveClass('ca-county-card--highlighted');
    });

    it('calls onClick when provided', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<CountyCard name="San Francisco" region="bay-area" onClick={handleClick} />);

      const card = screen.getByRole('button');
      await user.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot Testing', () => {
    it('matches snapshot for basic card', () => {
      const { container } = render(
        <Card title="Test Card" description="Test description">
          Content
        </Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for county card', () => {
      const { container } = render(
        <CountyCard
          name="San Francisco"
          region="bay-area"
          population={873965}
          founded={1850}
          area={231}
          seat="San Francisco"
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
