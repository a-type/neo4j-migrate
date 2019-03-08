module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: '(src/.*__integration_tests__/.*\\.(test|spec))\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
};
