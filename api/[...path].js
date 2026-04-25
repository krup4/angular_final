const { readFileSync } = require('node:fs');
const { randomUUID } = require('node:crypto');
const { join } = require('node:path');

const dbPath = join(process.cwd(), 'mock-server', 'db.json');
let db = loadDb();

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const credentials = await readBody(req);
      const user = db.users.find(
        (item) => item.email === credentials.email && item.password === credentials.password,
      );

      if (!user) {
        sendJson(res, 401, { message: 'Неверный email или пароль' });
        return;
      }

      const { password, ...safeUser } = user;
      sendJson(res, 200, {
        token: `mock-jwt-${user.id}`,
        user: safeUser,
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/categories') {
      sendJson(
        res,
        200,
        db.categories.filter((item) => item.userId === url.searchParams.get('userId')),
      );
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/subscriptions') {
      sendJson(
        res,
        200,
        db.subscriptions.filter((item) => item.userId === url.searchParams.get('userId')),
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/subscriptions') {
      const draft = await readBody(req);
      const created = { ...draft, id: randomUUID(), currency: 'RUB' };
      db.subscriptions.push(created);
      sendJson(res, 201, created);
      return;
    }

    const subscriptionMatch = url.pathname.match(/^\/api\/subscriptions\/([^/]+)$/);

    if (subscriptionMatch && req.method === 'PUT') {
      const id = subscriptionMatch[1];
      const updated = await readBody(req);
      const index = db.subscriptions.findIndex((item) => item.id === id);

      if (index === -1) {
        sendJson(res, 404, { message: 'Подписка не найдена' });
        return;
      }

      db.subscriptions[index] = { ...updated, id };
      sendJson(res, 200, db.subscriptions[index]);
      return;
    }

    if (subscriptionMatch && req.method === 'DELETE') {
      const id = subscriptionMatch[1];
      db.subscriptions = db.subscriptions.filter((item) => item.id !== id);
      res.statusCode = 204;
      res.end();
      return;
    }

    sendJson(res, 404, { message: 'Mock route not found' });
  } catch (error) {
    sendJson(res, 500, { message: error instanceof Error ? error.message : 'Mock server error' });
  }
};

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

function sendJson(res, status, body) {
  res.statusCode = status;
  res.end(body === null ? '' : JSON.stringify(body));
}
