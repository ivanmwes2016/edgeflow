interface Props {
  yaml: string;
  visible: boolean;
  onClose: () => void;
}

export default function ConfigModal({ yaml, visible, onClose }: Props) {
  if (!visible) return null;

  const handleCopy = () => navigator.clipboard.writeText(yaml);
  const handleDownload = () => {
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "docker-compose.yml";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70"
      onClick={onClose}>
      <div
        className="flex w-150 max-h-[80vh] flex-col rounded-[14px] border border-slate-800 bg-[#0d1117]"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
          <span className="font-mono text-[13px] font-semibold text-green-300">
            docker-compose.yml
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="cursor-pointer rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors">
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="cursor-pointer rounded-md bg-green-950 px-3 py-1 text-xs text-green-300 hover:bg-green-900 transition-colors">
              Download
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer bg-transparent text-lg text-slate-500 hover:text-slate-300 transition-colors">
              ×
            </button>
          </div>
        </div>
        <pre className="m-0 flex-1 overflow-auto p-4 font-mono text-xs leading-[1.7] text-slate-200">
          {yaml}
        </pre>
      </div>
    </div>
  );
}
