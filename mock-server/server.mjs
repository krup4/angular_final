import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { buildCategory, isBadRequest: isCategoryBadRequest } = require('./category-utils.cjs');
const { buildSubscription, isBadRequest } = require('./subscription-utils.cjs');
const dbPath = join(__dirname, 'db.json');
const port = Number(process.env.MOCK_PORT ?? 3000);

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`);
    const db = await readDb();

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const credentials = await readBody(request);
      const user = db.users.find(
        (item) => item.email === credentials.email && item.password === credentials.password,
      );

      if (!user) {
        sendJson(response, 401, { message: 'Неверный email или пароль' });
        return;
      }

      const { password, ...safeUser } = user;
      sendJson(response, 200, {
        token: `mock-jwt-${user.id}`,
        user: safeUser,
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/categories') {
      sendJson(response, 200, db.categories.filter((item) => item.userId === url.searchParams.get('userId')));
      return;
    }

    const categoryMatch = url.pathname.match(/^\/api\/categories\/([^/]+)$/);

    if (categoryMatch && request.method === 'PUT') {
      const id = categoryMatch[1];
      const draft = await readBody(request);
      const index = db.categories.findIndex((item) => item.id === id);

      if (index === -1) {
        sendJson(response, 404, { message: 'Категория не найдена' });
        return;
      }

      db.categories[index] = buildCategory(draft, db.categories[index]);
      await writeDb(db);
      sendJson(response, 200, db.categories[index]);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/subscriptions') {
      sendJson(
        response,
        200,
        db.subscriptions.filter((item) => item.userId === url.searchParams.get('userId')),
      );
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/subscriptions') {
      const draft = await readBody(request);
      const created = buildSubscription(draft, {
        categories: db.categories,
        id: randomUUID(),
      });
      db.subscriptions.push(created);
      await writeDb(db);
      sendJson(response, 201, created);
      return;
    }

    const subscriptionMatch = url.pathname.match(/^\/api\/subscriptions\/([^/]+)$/);

    if (subscriptionMatch && request.method === 'PUT') {
      const id = subscriptionMatch[1];
      const draft = await readBody(request);
      const index = db.subscriptions.findIndex((item) => item.id === id);

      if (index === -1) {
        sendJson(response, 404, { message: 'Подписка не найдена' });
        return;
      }

      db.subscriptions[index] = buildSubscription(draft, {
        categories: db.categories,
        existing: db.subscriptions[index],
        id,
      });
      await writeDb(db);
      sendJson(response, 200, db.subscriptions[index]);
      return;
    }

    if (subscriptionMatch && request.method === 'DELETE') {
      const id = subscriptionMatch[1];
      db.subscriptions = db.subscriptions.filter((item) => item.id !== id);
      await writeDb(db);
      sendJson(response, 200, { id });
      return;
    }

    sendJson(response, 404, { message: 'Mock route not found' });
  } catch (error) {
    sendJson(response, isBadRequest(error) || isCategoryBadRequest(error) ? 400 : 500, {
      message: error instanceof Error ? error.message : 'Mock server error',
    });
  }
});

server.listen(port, () => {
  console.log(`Mock API is running on http://localhost:${port}`);
});

async function readDb() {
  return JSON.parse(await readFile(dbPath, 'utf8'));
}

async function writeDb(db) {
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`);
}

async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(body === null ? '' : JSON.stringify(body));
}
