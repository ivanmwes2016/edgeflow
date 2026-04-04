import { Play, FileCode, Cpu, Trash2 } from "lucide-react";

interface Props {
  onSimulate: () => void;
  onGenerate: () => void;
  onAnalyse: () => void;
  onClear: () => void;
  nodeCount: number;
  simulating: boolean;
}

export default function Toolbar({
  onSimulate,
  onGenerate,
  onAnalyse,
  onClear,
  nodeCount,
  simulating,
}: Props) {
  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    border: "none",
    transition: "all 0.15s",
  };

  return (
    <div className=" h-14 bg-[#0d1117] border-b border-b-gray-800 flex items-center gap-3 px-2 ">
      <button
        onClick={onSimulate}
        disabled={nodeCount === 0 || simulating}
        style={{
          ...btnBase,
          background: simulating ? "#1e3a5f" : "#0369a1",
          color: simulating ? "#94a3b8" : "#fff",
        }}>
        <Play size={14} />
        {simulating ? "Deploying..." : "Simulate Deploy"}
      </button>

      <button
        onClick={onGenerate}
        disabled={nodeCount === 0}
        style={{ ...btnBase, background: "#14532d", color: "#86efac" }}>
        <FileCode size={14} />
        Generate Config
      </button>

      <button
        onClick={onAnalyse}
        disabled={nodeCount === 0}
        style={{ ...btnBase, background: "#312e81", color: "#c4b5fd" }}>
        <Cpu size={14} />
        AI Analyse
      </button>

      <div style={{ flex: 1 }} />

      <div
        style={{
          fontSize: 12,
          color: "#475569",
          fontFamily: "JetBrains Mono, monospace",
        }}>
        {nodeCount} service{nodeCount !== 1 ? "s" : ""}
      </div>

      <button
        onClick={onClear}
        style={{
          ...btnBase,
          background: "transparent",
          color: "#ef4444",
          border: "1px solid #7f1d1d",
        }}>
        <Trash2 size={13} />
        Clear
      </button>
    </div>
  );
}
