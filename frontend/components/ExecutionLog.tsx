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
    <div className="flex-1 bg-slate-950/80 text-xs p-3 overflow-auto scroll-thin">
      {logs.length === 0 && (
        <div className="text-slate-500 text-sm">
          Logs will appear here as the agent runs.
        </div>
      )}
      <div className="space-y-1.5">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="mt-[2px] text-[10px] text-slate-500 whitespace-nowrap">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 mb-0.5">
                <span className={`${typeColor[log.type] ?? 'text-slate-200'} text-[10px] font-semibold`}>{log.type.toUpperCase()}</span>
              </div>
              <div className="text-slate-100 whitespace-pre-wrap leading-snug">
                {log.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutionLog;
