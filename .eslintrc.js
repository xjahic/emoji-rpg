import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      semi: ['error', 'never'],
      '@typescript-eslint/semi': ['error', 'never'],
      quotes: ['error', 'single'],
      'comma-dangle': ['error', 'never'],
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  }
]
