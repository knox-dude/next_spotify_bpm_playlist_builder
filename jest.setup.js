import '@testing-library/jest-dom';
const { TextEncoder, TextDecoder } = require('util');
Object.assign(global, { TextDecoder, TextEncoder });
// Makes fetch available globally to prevent a Warning
import 'whatwg-fetch';
global.fetch = require('jest-fetch-mock');

fetch.mockResponse(JSON.stringify({ testing: true })); // mock every fetchCall in all tests with this default value
