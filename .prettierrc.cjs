module.exports = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  bracketSpacing: true,
  importOrder: [
    '^react(.*)', // React
    '@\\/(.*)', // Зависимости с @/
    '^@\\b(?:(?!helpers|hooks|libs|types|ui)\\w)+\\b', // Зависимости с @
    '^\\w+', // Зависимости
    '^(@helpers|@hooks|@libs|@types|@ui)', // Элиасы, внутренние директории
    '^([.]+\\/(\\b(?:(?!.*?css$|.*?scss$)\\w)+\\b)|(\\.\\.)+\\/)', // Относительные пути, кроме style
    '\\/*.*.s?css$', // Стили
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    {
      files: '**/*.scss',
      options: {
        singleQuote: false,
      },
    },
  ],
};
