const API_BASE = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000';

const chatLogEl = document.getElementById('chat-log');
const promptInputEl = document.getElementById('prompt-input');
const chatFormEl = document.getElementById('chat-form');
const screenshotImgEl = document.getElementById('browser-screenshot');
const placeholderEl = document.getElementById('browser-placeholder');
const takeScreenshotBtn = document.getElementById('take-screenshot-btn');
const closeSessionBtn = document.getElementById('close-session-btn');
const wsStatusDot = document.getElementById('ws-status-dot');
const wsStatusText = document.getElementById('ws-status-text');

function formatTimestamp(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function appendLogEntry({ timestamp, type = 'info', message, role = 'system' }) {
  if (!message) return;
  const entry = document.createElement('div');
  entry.className = `chat-entry ${type} ${role}`;

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

function setWsStatus(stateClass, label) {
  if (!wsStatusDot || !wsStatusText) return;
  wsStatusDot.classList.remove('connected', 'disconnected', 'error');
  if (stateClass) {
    wsStatusDot.classList.add(stateClass);
  }
  wsStatusText.textContent = label;
}

function connectWebSocket() {
  setWsStatus('', 'Connecting...');
  const ws = new WebSocket(WS_URL);

  ws.addEventListener('message', (event) => {
    try {
      const payload = JSON.parse(event.data);
      appendLogEntry({ ...payload, role: 'system' });
    } catch (e) {
      console.error('Failed to parse WebSocket message', e);
    }
  });

  ws.addEventListener('open', () => {
    setWsStatus('connected', 'Connected');
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'info',
      role: 'system',
      message: 'Connected to execution stream.',
    });
  });

  ws.addEventListener('close', () => {
    setWsStatus('disconnected', 'Disconnected');
    appendLogEntry({
      timestamp: new Date().toISOString(),
      type: 'error',
      role: 'system',
      message: 'Execution stream disconnected. Refresh the page to reconnect.',
    });
  });

  ws.addEventListener('error', () => {
    setWsStatus('error', 'Error');
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
      role: 'system',
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
      role: 'system',
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
      role: 'system',
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
    role: 'user',
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
