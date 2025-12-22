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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 h-full">
      <textarea
        className="flex-1 rounded bg-gray-900 p-2 text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Describe the web task you want to automate..."
      />
      <button
        type="submit"
        disabled={isLoading}
        className="py-2 px-4 rounded bg-blue-600 disabled:opacity-50 text-sm font-medium"
      >
        {isLoading ? "Running..." : "Run automation"}
      </button>
    </form>
  );
};

export default PromptInput;
