module.exports = [
  {
    languageOptions: {
      globals: {
        myCustomGlobal: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    rules: {
      'no-console': 'error',
      semi: 'error',
      'no-unused-vars': 'warn'
    }
  }
];
