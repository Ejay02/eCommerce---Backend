// const eslintPluginBrowser = require('eslint-plugin-browser');

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
    // plugins: {
    //   browser: eslintPluginBrowser
    // },
    rules: {
      'no-console': 'error',
      semi: 'error',
      'no-unused-vars': 'warn'
    }
  }
];
