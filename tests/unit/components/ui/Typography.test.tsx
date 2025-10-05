import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading, Text, Code, Label } from '@/components/ui/Typography';

describe('Typography Components', () => {
  describe('Heading Component', () => {
    describe('Rendering', () => {
      it('renders with default props', () => {
        render(<Heading>Test Heading</Heading>);

        const heading = screen.getByRole('heading', { name: /test heading/i });
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe('H2'); // default level
      });

      it('renders all heading levels correctly', () => {
        const levels = [1, 2, 3, 4, 5, 6] as const;

        levels.forEach(level => {
          const { unmount } = render(<Heading level={level}>Level {level}</Heading>);
          const heading = screen.getByRole('heading', { name: `Level ${level}` });
          expect(heading.tagName).toBe(`H${level}`);
          unmount();
        });
      });

      it('renders all size variants correctly', () => {
        const sizes = ['display', 'title', 'section', 'subsection', 'label'] as const;

        sizes.forEach(size => {
          const { unmount } = render(<Heading size={size}>{size}</Heading>);
          const heading = screen.getByRole('heading', { name: size });
          expect(heading).toHaveClass(`ca-heading--${size}`);
          unmount();
        });
      });

      it('renders with custom className', () => {
        render(<Heading className="custom-class">Test</Heading>);

        const heading = screen.getByRole('heading', { name: /test/i });
        expect(heading).toHaveClass('custom-class');
      });
    });

    describe('Text Colors', () => {
      it('renders all color variants', () => {
        const colors = ['primary', 'secondary', 'tertiary', 'inverse', 'inherit'] as const;

        colors.forEach(color => {
          const { unmount } = render(<Heading color={color}>{color}</Heading>);
          const heading = screen.getByRole('heading', { name: color });
          expect(heading).toHaveClass(`ca-text--${color}`);
          unmount();
        });
      });
    });

    describe('Text Alignment', () => {
      it('renders all alignment options', () => {
        const alignments = ['left', 'center', 'right', 'justify'] as const;

        alignments.forEach(align => {
          const { unmount } = render(<Heading align={align}>{align}</Heading>);
          const heading = screen.getByRole('heading', { name: align });
          expect(heading).toHaveClass(`ca-text--${align}`);
          unmount();
        });
      });
    });

    describe('Font Weight', () => {
      it('renders all weight variants', () => {
        const weights = ['normal', 'medium', 'semibold', 'bold'] as const;

        weights.forEach(weight => {
          const { unmount } = render(<Heading weight={weight}>{weight}</Heading>);
          const heading = screen.getByRole('heading', { name: weight });
          expect(heading).toHaveClass(`ca-text--weight-${weight}`);
          unmount();
        });
      });
    });

    describe('Text Truncation', () => {
      it('truncates text when truncate is true', () => {
        render(<Heading truncate>Long heading text</Heading>);

        const heading = screen.getByRole('heading', { name: /long heading text/i });
        expect(heading).toHaveClass('ca-text--truncate');
      });

      it('clamps text to specified number of lines', () => {
        render(<Heading clamp={3}>Multi-line heading</Heading>);

        const heading = screen.getByRole('heading', { name: /multi-line heading/i });
        expect(heading).toHaveClass('ca-text--clamp-3');
      });
    });
  });

  describe('Text Component', () => {
    describe('Rendering', () => {
      it('renders with default props', () => {
        render(<Text>Test text</Text>);

        const text = screen.getByText('Test text');
        expect(text).toBeInTheDocument();
        expect(text.tagName).toBe('P'); // default as prop
      });

      it('renders all size variants', () => {
        const sizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const;

        sizes.forEach(size => {
          const { unmount } = render(<Text size={size}>{size}</Text>);
          const text = screen.getByText(size);
          expect(text).toHaveClass(`ca-text--${size}`);
          unmount();
        });
      });

      it('renders with different HTML elements', () => {
        const elements = ['p', 'span', 'div', 'label'] as const;

        elements.forEach(as => {
          const { unmount } = render(<Text as={as}>{as}</Text>);
          const text = screen.getByText(as);
          expect(text.tagName).toBe(as.toUpperCase());
          unmount();
        });
      });

      it('renders with custom className', () => {
        render(<Text className="custom-class">Test</Text>);

        const text = screen.getByText('Test');
        expect(text).toHaveClass('custom-class');
      });
    });

    describe('Line Height', () => {
      it('renders all leading variants', () => {
        const leadings = ['tight', 'normal', 'relaxed', 'loose'] as const;

        leadings.forEach(leading => {
          const { unmount } = render(<Text leading={leading}>{leading}</Text>);
          const text = screen.getByText(leading);
          expect(text).toHaveClass(`ca-text--leading-${leading}`);
          unmount();
        });
      });
    });

    describe('Text Styling', () => {
      it('applies color classes', () => {
        render(<Text color="secondary">Secondary text</Text>);

        const text = screen.getByText('Secondary text');
        expect(text).toHaveClass('ca-text--secondary');
      });

      it('applies weight classes', () => {
        render(<Text weight="bold">Bold text</Text>);

        const text = screen.getByText('Bold text');
        expect(text).toHaveClass('ca-text--weight-bold');
      });

      it('applies truncation', () => {
        render(<Text truncate>Truncated text</Text>);

        const text = screen.getByText('Truncated text');
        expect(text).toHaveClass('ca-text--truncate');
      });
    });
  });

  describe('Code Component', () => {
    describe('Inline Code', () => {
      it('renders inline code by default', () => {
        render(<Code>const test = true;</Code>);

        const code = screen.getByText('const test = true;');
        expect(code.tagName).toBe('CODE');
        expect(code).toHaveClass('ca-code--inline');
      });

      it('renders inline code when inline is true', () => {
        render(<Code inline>inline code</Code>);

        const code = screen.getByText('inline code');
        expect(code.tagName).toBe('CODE');
        expect(code).toHaveClass('ca-code--inline');
      });
    });

    describe('Block Code', () => {
      it('renders block code when inline is false', () => {
        render(<Code inline={false}>function test() {'{}'}</Code>);

        const pre = screen.getByText('function test() {}').closest('pre');
        expect(pre).toBeInTheDocument();
        expect(pre).toHaveClass('ca-code-pre');
      });

      it('applies language class', () => {
        render(<Code inline={false} language="javascript">const x = 1;</Code>);

        const code = screen.getByText('const x = 1;');
        expect(code).toHaveClass('language-javascript');
      });
    });

    describe('Custom Styling', () => {
      it('applies custom className', () => {
        render(<Code className="custom-code">code</Code>);

        const code = screen.getByText('code');
        expect(code).toHaveClass('custom-code');
      });
    });
  });

  describe('Label Component', () => {
    describe('Rendering', () => {
      it('renders as label element', () => {
        render(<Label>Test Label</Label>);

        const label = screen.getByText('Test Label');
        expect(label.tagName).toBe('LABEL');
      });

      it('has default styling', () => {
        render(<Label>Test</Label>);

        const label = screen.getByText('Test');
        expect(label).toHaveClass('ca-text--sm');
        expect(label).toHaveClass('ca-text--weight-medium');
      });

      it('renders with htmlFor attribute', () => {
        render(<Label htmlFor="test-input">Label</Label>);

        const label = screen.getByText('Label');
        expect(label).toHaveAttribute('for', 'test-input');
      });
    });

    describe('Required Indicator', () => {
      it('shows asterisk when required is true', () => {
        render(<Label required>Required Field</Label>);

        const asterisk = screen.getByLabelText('required');
        expect(asterisk).toBeInTheDocument();
        expect(asterisk).toHaveTextContent('*');
      });

      it('hides asterisk when required is false', () => {
        render(<Label required={false}>Optional Field</Label>);

        expect(screen.queryByLabelText('required')).not.toBeInTheDocument();
      });
    });

    describe('Inherited Props', () => {
      it('accepts Text component props', () => {
        render(<Label color="secondary" weight="bold">Custom Label</Label>);

        const label = screen.getByText('Custom Label');
        expect(label).toHaveClass('ca-text--secondary');
        expect(label).toHaveClass('ca-text--weight-bold');
      });
    });
  });

  describe('Snapshot Testing', () => {
    it('matches snapshot for heading', () => {
      const { container } = render(<Heading level={1} size="display">Main Heading</Heading>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for text', () => {
      const { container } = render(<Text size="lg" weight="medium">Body text</Text>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for code block', () => {
      const { container } = render(
        <Code inline={false} language="typescript">
          const test: string = 'hello';
        </Code>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for label', () => {
      const { container } = render(<Label required htmlFor="test">Required Label</Label>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
