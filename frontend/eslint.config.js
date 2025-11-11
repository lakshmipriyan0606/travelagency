module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',  // Enforce fixing unused imports
    'react-hooks/exhaustive-deps': 'warn',  // For useRef/useEffect deps
  },
};