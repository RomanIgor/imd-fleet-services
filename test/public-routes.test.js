const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('express');
const publicRoutes = require('../routes/public');

function request(app, path) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      http.get({ hostname: '127.0.0.1', port, path }, res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          server.close(() => resolve({ statusCode: res.statusCode, body }));
        });
      }).on('error', err => {
        server.close(() => reject(err));
      });
    });
  });
}

test('serves the main site at /', async () => {
  const app = express();
  app.use(publicRoutes);

  const res = await request(app, '/');

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /IMD Fleet Services/);
});
