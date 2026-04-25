const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const dbPath = join(process.cwd(), 'mock-server', 'db.json');

function loadDb() {
  return JSON.parse(readFileSync(dbPath, 'utf8'));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function applyCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function handleOptions(req, res) {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  res.statusCode = 204;
  res.end();
  return true;
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.end(body === null ? '' : JSON.stringify(body));
}

module.exports = {
  applyCors,
  handleOptions,
  loadDb,
  readBody,
  sendJson,
};
