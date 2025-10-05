module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // Prevent direct console usage (allow warn/error for debugging)
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // Prevent unused imports
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    // Prevent direct localStorage usage (use Zustand persist)
    'no-restricted-globals': ['error', {
      name: 'localStorage',
      message: 'Use Zustand persist instead of direct localStorage access'
    }],
  },
}
