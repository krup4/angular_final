const { readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { get, put } = require('@vercel/blob');

const dbPath = join(process.cwd(), 'mock-server', 'db.json');
const blobPath = 'subscription-manager/mock-server/db.json';

function shouldUseBlobStore() {
  return Boolean(process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN);
}

function assertBlobConfigured() {
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is required for persistent mock data in Vercel');
  }
}

async function loadDb() {
  assertBlobConfigured();

  if (!shouldUseBlobStore()) {
    return cloneDb(readLocalDb());
  }

  const blob = await get(blobPath, { access: 'private', useCache: false });

  if (!blob) {
    const initialDb = readLocalDb();

    await put(blobPath, JSON.stringify(initialDb, null, 2), {
      access: 'private',
      allowOverwrite: true,
      contentType: 'application/json',
    });

    return cloneDb(initialDb);
  }

  if (!blob.stream) {
    return cloneDb(readLocalDb());
  }

  const text = await new Response(blob.stream).text();

  return cloneDb(JSON.parse(text));
}

async function saveDb(db) {
  assertBlobConfigured();

  if (shouldUseBlobStore()) {
    await put(blobPath, JSON.stringify(db, null, 2), {
      access: 'private',
      allowOverwrite: true,
      contentType: 'application/json',
    });
    return;
  }

  writeFileSync(dbPath, `${JSON.stringify(db, null, 2)}\n`);
}

function readBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body.length ? JSON.parse(req.body.toString('utf8')) : {});
  }

  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === 'string') {
    return Promise.resolve(req.body ? JSON.parse(req.body) : {});
  }

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

function readLocalDb() {
  return JSON.parse(readFileSync(dbPath, 'utf8'));
}

function cloneDb(db) {
  return JSON.parse(JSON.stringify(db));
}

module.exports = {
  applyCors,
  handleOptions,
  loadDb,
  readBody,
  saveDb,
  sendJson,
};
