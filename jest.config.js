module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files using ts-jest
    '^.+\\.jsx?$': 'babel-jest', // Transform JavaScript files using babel-jest
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'], // Matches test files with .js, .jsx, .ts, .tsx extensions
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Ensure you have a tsconfig.json file
    },
  },
};
