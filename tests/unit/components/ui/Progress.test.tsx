import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress, GameProgress, LoadingProgress } from '@/components/ui/Progress';

describe('Progress Component', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Progress value={50} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders all variants correctly', () => {
      const variants = ['default', 'success', 'warning', 'danger', 'gradient'] as const;

      variants.forEach(variant => {
        const { unmount } = render(<Progress value={50} variant={variant} />);
        const progressBar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
        expect(progressBar).toHaveClass(`ca-progress__bar--${variant}`);
        unmount();
      });
    });

    it('renders all sizes correctly', () => {
      const sizes = ['small', 'medium', 'large'] as const;

      sizes.forEach(size => {
        const { unmount } = render(<Progress value={50} size={size} />);
        const progress = screen.getByRole('progressbar').closest('.ca-progress');
        expect(progress).toHaveClass(`ca-progress--${size}`);
        unmount();
      });
    });

    it('renders with custom className', () => {
      render(<Progress value={50} className="custom-class" />);

      const progress = screen.getByRole('progressbar').closest('.ca-progress');
      expect(progress).toHaveClass('custom-class');
    });
  });

  describe('Value Calculation', () => {
    it('calculates percentage correctly with default max', () => {
      render(<Progress value={50} showLabel />);

      const percentageElements = screen.getAllByText('50%');
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('calculates percentage correctly with custom max', () => {
      render(<Progress value={25} max={50} showLabel />);

      const fractionLabels = screen.getAllByText('25 / 50');
      expect(fractionLabels.length).toBeGreaterThan(0);
      const percentageElements = screen.getAllByText('50%');
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('handles value of 0', () => {
      render(<Progress value={0} showLabel />);

      const percentageElements = screen.getAllByText('0%');
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('handles value equal to max', () => {
      render(<Progress value={100} showLabel />);

      const percentageElements = screen.getAllByText('100%');
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('clamps value above max to 100%', () => {
      render(<Progress value={150} max={100} />);

      const progressBar = screen.getByRole('progressbar');
      const bar = progressBar.querySelector('.ca-progress__bar') as HTMLElement;
      expect(bar.style.width).toBe('100%');
    });

    it('clamps negative value to 0%', () => {
      render(<Progress value={-10} />);

      const progressBar = screen.getByRole('progressbar');
      const bar = progressBar.querySelector('.ca-progress__bar') as HTMLElement;
      expect(bar.style.width).toBe('0%');
    });
  });

  describe('Label Display', () => {
    it('shows label when showLabel is true', () => {
      render(<Progress value={50} showLabel />);

      const percentageElements = screen.getAllByText('50%');
      expect(percentageElements.length).toBeGreaterThan(0);
    });

    it('hides label when showLabel is false', () => {
      render(<Progress value={50} showLabel={false} />);

      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('displays custom label', () => {
      render(<Progress value={50} showLabel label="Custom Label" />);

      const labels = screen.getAllByText('Custom Label');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('shows label inside bar when percentage > 20', () => {
      render(<Progress value={50} showLabel />);

      const percentageElements = screen.getAllByText('50%');
      const insideLabel = percentageElements.find(el => el.closest('.ca-progress__label--inside'));
      expect(insideLabel).toBeTruthy();
    });

    it('hides label inside bar when percentage <= 20', () => {
      render(<Progress value={15} showLabel />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      const insideLabel = bar?.querySelector('.ca-progress__label--inside');
      expect(insideLabel).not.toBeInTheDocument();
    });
  });

  describe('Animation and Styling', () => {
    it('adds animated class when animated is true', () => {
      render(<Progress value={50} animated />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      expect(bar).toHaveClass('ca-progress__bar--animated');
    });

    it('adds striped class when striped is true', () => {
      render(<Progress value={50} striped />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      expect(bar).toHaveClass('ca-progress__bar--striped');
    });

    it('sets width style based on percentage', () => {
      render(<Progress value={75} />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar') as HTMLElement;
      expect(bar.style.width).toBe('75%');
    });
  });

  describe('GameProgress Component', () => {
    it('renders with completed counties', () => {
      render(<GameProgress completedCounties={38} />);

      const labels = screen.getAllByText('38 of 58 counties');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('uses custom total counties', () => {
      render(<GameProgress completedCounties={25} totalCounties={50} />);

      const labels = screen.getAllByText('25 of 50 counties');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('shows success variant when 100% complete', () => {
      render(<GameProgress completedCounties={58} totalCounties={58} />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      expect(bar).toHaveClass('ca-progress__bar--success');
    });

    it('shows warning variant when >= 75% complete', () => {
      render(<GameProgress completedCounties={44} totalCounties={58} />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      expect(bar).toHaveClass('ca-progress__bar--warning');
    });

    it('shows gradient variant when < 75% complete', () => {
      render(<GameProgress completedCounties={30} totalCounties={58} />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      expect(bar).toHaveClass('ca-progress__bar--gradient');
    });

    it('shows milestones when enabled', () => {
      render(<GameProgress completedCounties={30} showMilestones />);

      const milestones = screen.getByRole('progressbar').closest('.ca-game-progress')?.querySelector('.ca-game-progress__milestones');
      expect(milestones).toBeInTheDocument();
    });

    it('displays correct milestone markers', () => {
      const { container } = render(<GameProgress completedCounties={30} showMilestones />);

      const markers = container.querySelectorAll('.ca-game-progress__milestone-marker');
      expect(markers).toHaveLength(4); // Explorer, Adventurer, Expert, Master
    });

    it('marks achieved milestones', () => {
      const { container } = render(<GameProgress completedCounties={50} showMilestones />);

      const achievedMarkers = container.querySelectorAll('.ca-game-progress__milestone-marker--achieved');
      expect(achievedMarkers.length).toBeGreaterThan(0);
    });
  });

  describe('LoadingProgress Component', () => {
    it('renders with default loading label', () => {
      render(<LoadingProgress />);

      const labels = screen.getAllByText('Loading...');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('renders with custom label', () => {
      render(<LoadingProgress label="Please wait..." />);

      const labels = screen.getAllByText('Please wait...');
      expect(labels.length).toBeGreaterThan(0);
    });

    it('has animated and striped styles', () => {
      render(<LoadingProgress />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      expect(bar).toHaveClass('ca-progress__bar--animated');
      expect(bar).toHaveClass('ca-progress__bar--striped');
    });

    it('has gradient variant', () => {
      render(<LoadingProgress />);

      const bar = screen.getByRole('progressbar').querySelector('.ca-progress__bar');
      expect(bar).toHaveClass('ca-progress__bar--gradient');
    });
  });

  describe('Accessibility', () => {
    it('has proper progressbar role', () => {
      render(<Progress value={50} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has correct aria attributes', () => {
      render(<Progress value={30} max={60} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '60');
    });
  });

  describe('Snapshot Testing', () => {
    it('matches snapshot for basic progress', () => {
      const { container } = render(<Progress value={50} showLabel />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for game progress', () => {
      const { container } = render(<GameProgress completedCounties={38} showMilestones />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
