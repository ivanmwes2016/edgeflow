import { useEffect, useRef } from "react";

interface Props {
  steps: string[];
  visible: boolean;
  onClose: () => void;
}

export default function SimPanel({ steps, visible, onClose }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps]);

  if (!visible) return null;

  const isDone = steps.some((s) => s.includes("✅") || s.includes("❌"));
  const isSuccess = isDone && steps.some((s) => s.includes("✅"));
  const isError = isDone && steps.some((s) => s.includes("❌"));
  const progress = isDone
    ? 100
    : Math.min(Math.round((steps.length / 10) * 100), 99);

  return (
    <div className="absolute right-4 top-17 bottom-4 w-75 bg-[#0d1117] border border-[#1e293b] rounded-xl flex flex-col z-10 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-[#1e293b]">
        <span className="text-xs font-semibold text-sky-400 font-mono tracking-widest">
          DEPLOYMENT LOG
        </span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 bg-transparent border-none cursor-pointer text-lg leading-none">
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {steps.length === 0 && (
          <p className="text-xs text-slate-500 px-1 py-2">
            Waiting for deployment...
          </p>
        )}

        {steps.map((step, idx) => {
          const lineSuccess = step.includes("✅");
          const lineError = step.includes("❌");
          const isLatest = idx === steps.length - 1;

          return (
            <div
              key={idx}
              className={`
                px-3 py-1.5 rounded-md text-xs font-mono leading-relaxed border
                ${lineSuccess ? "bg-[#052e16] border-[#166534] text-green-300" : ""}
                ${lineError ? "bg-[#1c0a0a] border-[#7f1d1d] text-red-300" : ""}
                ${!lineSuccess && !lineError && isLatest && !isDone ? "bg-[#0f2744] border-[#1e293b] text-slate-200" : ""}
                ${!lineSuccess && !lineError && (!isLatest || isDone) ? "bg-[#111827] border-[#1e293b] text-slate-300" : ""}
              `}>
              {step}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Progress bar */}
      <div className="px-3 py-2 border-t border-[#1e293b]">
        <div className="h-0.75 bg-[#1e293b] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isError ? "bg-red-500" : "bg-sky-400"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          {isDone
            ? isSuccess
              ? "Deployment complete"
              : "Deployment failed"
            : `${progress}% — ${steps.length} log lines received`}
        </p>
      </div>
    </div>
  );
}
