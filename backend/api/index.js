import { createServer } from 'http';
import { app } from '../src/server.js';

const server = createServer(app);

export default async function handler(req, res) {
  server.emit('request', req, res);
}
