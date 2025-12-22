import { useState, useEffect } from 'react';
import axios from 'axios';

export const useBrowserState = () => {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000'); // Note: same port if using single server instance, or 5001 if separate
    ws.onmessage = (e) => {
      const log = JSON.parse(e.data);
      setLogs(prev => [...prev, log]);
      if (log.type === 'success' && log.message === 'Task completed.') {
        setIsExecuting(false);
      }
    };
    return () => ws.close();
  }, []);

  // Poll for screenshots during execution
  useEffect(() => {
    if (!isExecuting) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/screenshot');
        if (res.data.screenshot) setScreenshot(res.data.screenshot);
      } catch (e) { /* ignore errors while polling */ }
    }, 2000);
    return () => clearInterval(interval);
  }, [isExecuting]);

  const executePrompt = async (prompt: string) => {
    setIsExecuting(true);
    setLogs([]);
    await axios.post('http://localhost:5000/api/execute', { prompt });
    // isExecuting will be set to false when a 'completed' log is received via WS
  };

  return { screenshot, logs, isExecuting, executePrompt };
};
