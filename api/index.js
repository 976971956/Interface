const serverless = require('serverless-http');
const app = require('../app');

console.log('API function loaded successfully');

const handler = serverless(app, {
  request: (request, event, context) => {
    console.log('Request received:', request.method, request.url);
    return request;
  },
  response: (response, event, context) => {
    console.log('Response sent:', response.statusCode);
    return response;
  }
});

module.exports = handler; 