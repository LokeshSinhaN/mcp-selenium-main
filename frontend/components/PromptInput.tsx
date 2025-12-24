"use client";
import { useState } from "react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void | Promise<void>;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [value, setValue] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    await onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-xs uppercase tracking-wide text-slate-400 font-medium">
        Describe what you want the agent to do
      </label>
      <div className="relative">
        <textarea
          className="w-full min-h-[96px] max-h-48 resize-y rounded-xl bg-slate-900/70 border border-slate-700/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-inner"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Example: Open github.com, search for 'mcp selenium', and click the first repository."
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
        <span>Gemini 2.5 Flash will plan steps and control the browser for you.</span>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Running…' : 'Run automation'}
        </button>
      </div>
    </form>
  );
};

export default PromptInput;
