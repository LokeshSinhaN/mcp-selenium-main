'use client';
import { useBrowserState } from '@/hooks/useBrowserState';
import PromptInput from '@/components/PromptInput';
import BrowserPreview from '@/components/BrowserPreview';
import ExecutionLog from '@/components/ExecutionLog';

export default function Home() {
  const { screenshot, logs, isExecuting, executePrompt } = useBrowserState();

  return (
    <main className="h-screen w-full bg-gray-900 text-white flex flex-col">
      <header className="p-4 border-b border-gray-800 font-bold">Gemini Selenium Automation</header>
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        
        {/* Left: Prompt */}
        <div className="col-span-3 bg-gray-800 rounded-lg p-4">
          <PromptInput onSubmit={executePrompt} isLoading={isExecuting} />
        </div>

        {/* Middle: Browser */}
        <div className="col-span-6 bg-black rounded-lg border border-gray-700 overflow-hidden relative">
          <BrowserPreview screenshot={screenshot} />
        </div>

        {/* Right: Logs */}
        <div className="col-span-3 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
          <ExecutionLog logs={logs} />
        </div>
        
      </div>
    </main>
  );
}
