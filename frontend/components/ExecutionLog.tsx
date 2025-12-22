"use client";

interface LogEntry {
  timestamp: string;
  type: string;
  message: string;
}

interface ExecutionLogProps {
  logs: LogEntry[];
}

const typeColor: Record<string, string> = {
  info: "text-gray-300",
  gemini: "text-purple-300",
  action: "text-blue-300",
  success: "text-green-300",
  error: "text-red-400",
};

const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs }) => {
  return (
    <div className="flex-1 bg-black text-xs p-3 overflow-auto">
      {logs.map((log, idx) => (
        <div key={idx} className="mb-1">
          <span className="text-gray-500 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span className={`${typeColor[log.type] ?? "text-gray-200"} mr-2`}>{log.type.toUpperCase()}:</span>
          <span className="text-gray-100 whitespace-pre-wrap">{log.message}</span>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-gray-500">Logs will appear here as the agent runs.</div>
      )}
    </div>
  );
};

export default ExecutionLog;
