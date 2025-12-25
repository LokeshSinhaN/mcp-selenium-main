import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import GeminiExecutor from './gemini-executor.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app); // Attach Express to HTTP server
const wss = new WebSocketServer({ server }); // Attach WS to HTTP server

app.use(cors());
app.use(express.json());

// Serve static frontend (40% chat / 60% browser preview UI)
const frontendDir = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendDir));

const executor = new GeminiExecutor(process.env.GEMINI_API_KEY);

// WebSocket Logging
const clients = new Set();
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

const broadcast = (log) => clients.forEach(c => c.readyState === 1 && c.send(JSON.stringify(log)));

// API Endpoints
app.post('/api/execute', (req, res) => {
  const { prompt } = req.body;
  res.json({ status: 'started' });
  
  // Run async
  executor.executePrompt(prompt, broadcast).catch(e => {
    broadcast({ type: 'error', message: e.message, timestamp: new Date().toISOString() });
  });
});

app.get('/api/screenshot', async (req, res) => {
  try {
    const result = await executor.browserController.takeScreenshot();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/close-session', async (req, res) => {
  await executor.browserController.closeSession();
  res.json({ status: 'closed' });
});

server.listen(5000, () => console.log('Server running on port 5000'));
