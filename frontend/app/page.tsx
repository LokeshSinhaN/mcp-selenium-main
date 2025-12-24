'use client';
import { useBrowserState } from '@/hooks/useBrowserState';
import PromptInput from '@/components/PromptInput';
import BrowserPreview from '@/components/BrowserPreview';
import ExecutionLog from '@/components/ExecutionLog';

export default function Home() {
  const { screenshot, logs, isExecuting, executePrompt } = useBrowserState();

  return (
    <main className="h-screen w-full bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 font-bold">
        Gemini 2.5 Flash · MCP Selenium Agent
      </header>
      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Left: Chat interface (logs + input) */}
        <div className="col-span-1 bg-gray-800 rounded-lg p-4 flex flex-col min-h-0">
          <h2 className="text-sm font-semibold mb-2 text-gray-200">Agent chat</h2>
          <div className="flex-1 min-h-0 border border-gray-700 rounded mb-3 overflow-hidden flex flex-col">
            <ExecutionLog logs={logs} />
          </div>
          <div className="mt-1">
            <PromptInput onSubmit={executePrompt} isLoading={isExecuting} />
          </div>
        </div>

        {/* Right: Browser interface (live screenshot) */}
        <div className="col-span-1 bg-black rounded-lg border border-gray-700 overflow-hidden relative flex flex-col">
          <h2 className="text-sm font-semibold px-4 py-2 border-b border-gray-800 text-gray-200 bg-gray-900/60">
            Browser viewport (controlled by agent)
          </h2>
          <div className="flex-1 min-h-0">
            <BrowserPreview screenshot={screenshot} />
          </div>
        </div>
      </div>
    </main>
  );
}
