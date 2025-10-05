#!/usr/bin/env python3
"""
ESLint Auto-Fixer Script
Systematically fixes common ESLint errors across the codebase.
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple

def fix_unused_vars(content: str, var_names: List[str]) -> str:
    """Prefix unused variables with underscore."""
    for var_name in var_names:
        # Fix destructured variables: const { foo } -> const { foo: _foo }
        content = re.sub(
            rf'\b({var_name})\b(?=\s*[,}}])',
            rf'{var_name}: _{var_name}',
            content
        )
        # Fix regular variables: const foo = -> const _foo =
        content = re.sub(
            rf'\bconst\s+{var_name}\b',
            f'const _{var_name}',
            content
        )
        # Fix let variables
        content = re.sub(
            rf'\blet\s+{var_name}\b',
            f'let _{var_name}',
            content
        )
        # Fix function parameters
        content = re.sub(
            rf'\(([^)]*)\b{var_name}\b([^)]*)\)',
            rf'(\1_{var_name}\2)',
            content
        )
    return content

def fix_case_declarations(content: str) -> str:
    """Wrap case block declarations in curly braces."""
    # Find case blocks with const/let declarations
    pattern = r'(case\s+[^:]+:)\s*(const|let)\s+'

    def replacer(match):
        return f'{match.group(1)} {{\n      {match.group(2)} '

    content = re.sub(pattern, replacer, content)

    # Add closing braces before next case or default
    lines = content.split('\n')
    fixed_lines = []
    in_case_block = False

    for i, line in enumerate(lines):
        if 'case ' in line and ':' in line and '{' in line:
            in_case_block = True
            fixed_lines.append(line)
        elif in_case_block and ('case ' in line or 'default:' in line or '}' in line):
            # Add closing brace before next case
            fixed_lines.append('    }')
            in_case_block = False
            fixed_lines.append(line)
        else:
            fixed_lines.append(line)

    return '\n'.join(fixed_lines)

def fix_explicit_any(content: str) -> str:
    """Replace explicit 'any' types with proper types."""
    replacements = [
        (r': any\[\]', ': unknown[]'),
        (r': any\b(?!\.)(?!\[)', ': unknown'),
        (r'<any>', '<unknown>'),
        (r'\(any\)', '(unknown)'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    return content

def fix_file(file_path: Path) -> Tuple[bool, str]:
    """Fix a single file."""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content

        # Apply fixes
        # Note: Specific unused vars would need to be detected from ESLint output
        # For now, we'll just fix common patterns

        # Fix explicit any types
        content = fix_explicit_any(content)

        # Fix case declarations
        content = fix_case_declarations(content)

        if content != original:
            file_path.write_text(content, encoding='utf-8')
            return True, "Fixed"
        return False, "No changes"
    except Exception as e:
        return False, f"Error: {e}"

def main():
    # Find all TypeScript files
    root = Path(__file__).parent.parent
    src_dir = root / 'src'

    ts_files = list(src_dir.rglob('*.ts')) + list(src_dir.rglob('*.tsx'))

    print(f"Found {len(ts_files)} TypeScript files")

    fixed_count = 0
    for file_path in ts_files:
        changed, msg = fix_file(file_path)
        if changed:
            print(f"✓ {file_path.relative_to(root)}: {msg}")
            fixed_count += 1

    print(f"\n Fixed {fixed_count} files")

if __name__ == '__main__':
    main()
