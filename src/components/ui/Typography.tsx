import React from 'react';
import './Typography.css';

// CONCEPT: Consistent typography components with semantic HTML
interface TypographyBaseProps {
  /** Children content */
  children: React.ReactNode;

  /** Text color variant */
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'inherit';

  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';

  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  /** Additional className */
  className?: string;

  /** Truncate text with ellipsis */
  truncate?: boolean;

  /** Maximum number of lines before truncation */
  clamp?: number;
}

// Heading Component
export interface HeadingProps extends TypographyBaseProps {
  /** Heading level for semantic HTML */
  level?: 1 | 2 | 3 | 4 | 5 | 6;

  /** Visual size (independent of semantic level) */
  size?: 'display' | 'title' | 'section' | 'subsection' | 'label';
}

/**
 * Heading Component
 *
 * Semantic heading with flexible visual sizing.
 * Separates semantic HTML level from visual appearance.
 *
 * @example
 * ```tsx
 * <Heading level={1} size="display">California Counties</Heading>
 * <Heading level={2} size="section">Bay Area Region</Heading>
 * ```
 */
export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  size,
  color = 'primary',
  align = 'left',
  weight = 'bold',
  truncate = false,
  clamp,
  className = '',
  children
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const headingClasses = [
    'ca-heading',
    size && `ca-heading--${size}`,
    `ca-text--${color}`,
    `ca-text--${align}`,
    `ca-text--weight-${weight}`,
    truncate && 'ca-text--truncate',
    clamp && `ca-text--clamp-${clamp}`,
    className
  ].filter(Boolean).join(' ');

  return React.createElement(
    Tag,
    { className: headingClasses },
    children
  );
};

// Text Component
export interface TextProps extends TypographyBaseProps {
  /** Text size */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';

  /** Semantic HTML element */
  as?: 'p' | 'span' | 'div' | 'label';

  /** Line height */
  leading?: 'tight' | 'normal' | 'relaxed' | 'loose';
}

/**
 * Text Component
 *
 * Flexible text component for body copy, labels, and descriptions.
 *
 * @example
 * ```tsx
 * <Text size="lg" weight="medium">County Information</Text>
 * <Text size="sm" color="secondary">Founded in 1850</Text>
 * ```
 */
export const Text: React.FC<TextProps> = ({
  as = 'p',
  size = 'base',
  color = 'primary',
  align = 'left',
  weight = 'normal',
  leading = 'normal',
  truncate = false,
  clamp,
  className = '',
  children
}) => {
  const textClasses = [
    'ca-text',
    `ca-text--${size}`,
    `ca-text--${color}`,
    `ca-text--${align}`,
    `ca-text--weight-${weight}`,
    `ca-text--leading-${leading}`,
    truncate && 'ca-text--truncate',
    clamp && `ca-text--clamp-${clamp}`,
    className
  ].filter(Boolean).join(' ');

  const Tag = as;

  return (
    <Tag className={textClasses}>
      {children}
    </Tag>
  );
};

// Code Component
export interface CodeProps {
  /** Code content */
  children: React.ReactNode;

  /** Display as inline or block */
  inline?: boolean;

  /** Programming language for syntax highlighting */
  language?: string;

  /** Additional className */
  className?: string;
}

/**
 * Code Component
 *
 * Display code snippets with proper formatting.
 *
 * @example
 * ```tsx
 * <Code inline>getRegionColor()</Code>
 * <Code language="javascript">
 *   const county = counties.find(c => c.id === id);
 * </Code>
 * ```
 */
export const Code: React.FC<CodeProps> = ({
  children,
  inline = true,
  language,
  className = ''
}) => {
  const codeClasses = [
    inline ? 'ca-code--inline' : 'ca-code--block',
    language && `language-${language}`,
    className
  ].filter(Boolean).join(' ');

  if (inline) {
    return <code className={codeClasses}>{children}</code>;
  }

  return (
    <pre className="ca-code-pre">
      <code className={codeClasses}>{children}</code>
    </pre>
  );
};

// Label Component
export interface LabelProps extends Omit<TextProps, 'as'> {
  /** HTML for attribute */
  htmlFor?: string;

  /** Required field indicator */
  required?: boolean;
}

/**
 * Label Component
 *
 * Form label with optional required indicator.
 *
 * @example
 * ```tsx
 * <Label htmlFor="county-select" required>
 *   Select County
 * </Label>
 * ```
 */
export const Label: React.FC<LabelProps> = ({
  required,
  children,
  ...props
}) => {
  return (
    <Text as="label" size="sm" weight="medium" {...props}>
      {children}
      {required && <span className="ca-label__required" aria-label="required">*</span>}
    </Text>
  );
};