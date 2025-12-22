"use client";

interface BrowserPreviewProps {
  screenshot: string | null;
}

const BrowserPreview: React.FC<BrowserPreviewProps> = ({ screenshot }) => {
  if (!screenshot) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
        No screenshot yet. Run a task to see the browser.
      </div>
    );
  }

  return (
    <img
      src={screenshot}
      alt="Browser screenshot"
      className="w-full h-full object-contain bg-black"
    />
  );
};

export default BrowserPreview;
