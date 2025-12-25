const API_BASE = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000';

const chatLogEl = document.getElementById('chat-log');
const promptInputEl = document.getElementById('prompt-input');
const chatFormEl = document.getElementById('chat-form');
const screenshotImgEl = document.getElementById('browser-screenshot');
const placeholderEl = document.getElementById('browser-placeholder');
const takeScreenshotBtn = document.getElementById('take-screenshot-btn');
const closeSessionBtn = document.getElementById('close-session-btn');

function formatTimestamp(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function appendLogEntry({ timestamp, type = 'info', message }) {
  if (!message) return;
  const entry = document.createElement('div');
  entry.className = `chat-entry ${type}`;

  const tsSpan = document.createElement('span');
  tsSpan.className = 'timestamp';
  tsSpan.textContent = formatTimestamp(timestamp) || '';

  const msgSpan = document.createElement('span');
  msgSpan.className = 'message';
  msgSpan.textContent = message;

  entry.appendChild(tsSpan);
  entry.appendChild(msgSpan);
  chatLogEl.appendChild(entry);
  chatLogEl.scrollTop = chatLogEl.scrollHeight;
}

function connectWebSocket() {
  const ws = new WebSocket(WS_URL);

  ws.addEventListener('message', (event) => {
    try {
      const payload = JSON.parse(event.data);
      appendLogEntry(payload);
    } catch (e) {
      console.error('Failed to parse WebSocket message', e);
    }
  });

  ws.addEventListener('open', () => {
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'info',
      message: 'Connected to execution stream.',
    });
  });

  ws.addEventListener('close', () => {
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'error',
      message: 'Execution stream disconnected. Refresh the page to reconnect.',
    });
  });
}

async function sendPrompt(prompt) {
  await fetch(`${API_BASE}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  }).catch((e) => {
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'error',
      message: `Failed to send prompt: ${e.message}`,
    });
  });
}

async function refreshScreenshot() {
  try {
    const res = await fetch(`${API_BASE}/api/screenshot`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.screenshot) {
      screenshotImgEl.src = data.screenshot;
      screenshotImgEl.hidden = false;
      placeholderEl.hidden = true;
    }
  } catch (e) {
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'error',
      message: `Failed to fetch screenshot: ${e.message}`,
    });
  }
}

async function closeSession() {
  try {
    await fetch(`${API_BASE}/api/close-session`, { method: 'POST' });
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'success',
      message: 'Browser session closed.',
    });
  } catch (e) {
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'error',
      message: `Failed to close session: ${e.message}`,
    });
  }
}

chatFormEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = promptInputEl.value.trim();
  if (!value) return;

  appendLogEntry({
    timestamp: new Date().toISOString(),
    type: 'info',
    message: value,
  });

  sendPrompt(value);
  promptInputEl.value = '';
});

promptInputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    chatFormEl.requestSubmit();
  }
});

if (takeScreenshotBtn) {
  takeScreenshotBtn.addEventListener('click', () => {
    refreshScreenshot();
  });
}

if (closeSessionBtn) {
  closeSessionBtn.addEventListener('click', () => {
    closeSession();
  });
}

connectWebSocket();
