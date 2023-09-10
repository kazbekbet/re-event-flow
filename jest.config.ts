/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.(scss|sass|css)$': 'identity-obj-proxy',
    '^@app/(.*)$': './src/app/$1',
    '^@entities/(.*)$': './src/entities/$1',
    '^@features/(.*)$': './src/features/$1',
    '^@pages/(.*)$': './src/pages/$1',
    '^@shared/(.*)$': './src/shared/$1',
    '^@libs/(.*)$': './src/libs/$1',
    '^@widgets/(.*)$': './src/widgets/$1',
  },
  transform: {
    '.test.[jt]sx?$': 'babel-jest',
    '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(.*\\.mjs)|rc-picker|@babel|rc-util|lodash-es)'],
};
