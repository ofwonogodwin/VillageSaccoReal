module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Allow unused variables starting with underscore
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'caughtErrorsIgnorePattern': '^_'
    }],
    // Allow any type in specific cases (will fix gradually)
    '@typescript-eslint/no-explicit-any': 'warn',
    // Allow unescaped entities in JSX
    'react/no-unescaped-entities': 'warn',
    // Allow empty interfaces for extending
    '@typescript-eslint/no-empty-object-type': 'warn',
    // React hooks dependencies
    'react-hooks/exhaustive-deps': 'warn'
  }
}
