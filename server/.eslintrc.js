module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: 'airbnb-base',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    quotes: 0,
    'comma-dangle': 0,
    'no-console': 0,
    'class-methods-use-this': 0,
    'no-underscore-dangle': 0,
    'consistent-return': 0,
    'arrow-parens': 0
  }
};
