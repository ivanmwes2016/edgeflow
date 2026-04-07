import type { AISuggestion } from "../types/base";

interface Props {
  suggestions: AISuggestion[];
  visible: boolean;
  loading: boolean;
  onClose: () => void;
}

const ICONS = { info: "ℹ️", warning: "⚠️", success: "✅" };
const COLORS = {
  info: "bg-[#0f2744] border-blue-700 text-blue-300",
  warning: "bg-[#2d1f00] border-amber-800 text-yellow-300",
  success: "bg-[#052e16] border-green-800 text-green-300",
};

export default function AIPanel({
  suggestions,
  visible,
  loading,
  onClose,
}: Props) {
  if (!visible) return null;

  return (
    <div className="absolute bottom-4 left-52 z-10 w-80 overflow-hidden rounded-xl border border-indigo-900 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-slate-800 px-3.5 py-3">
        <span className="font-mono text-xs font-semibold tracking-widest text-violet-400">
          ✦ AI ANALYSIS
        </span>
        <button
          onClick={onClose}
          className="cursor-pointer bg-transparent text-base text-slate-500 hover:text-slate-300 transition-colors">
          ×
        </button>
      </div>

      <div className="flex flex-col gap-2 p-3">
        {loading ? (
          <div className="py-4 text-center text-[13px] text-slate-500">
            Analysing architecture...
          </div>
        ) : (
          suggestions.map((s, i) => (
            <div
              key={i}
              className={`rounded-lg border px-3 py-2.5 ${COLORS[s.type]}`}>
              <div className="flex items-start gap-2">
                <span className="text-sm">{ICONS[s.type]}</span>
                <p className="text-xs leading-relaxed">{s.message}</p>
              </div>
            </div>
          ))
        )}
        <p className="pt-1 text-[10px] leading-1.5 text-slate-700">
          Connect Claude API key in backend/routes/ai.py for full AI analysis
        </p>
      </div>
    </div>
  );
}
