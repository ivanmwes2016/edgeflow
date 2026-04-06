import type { AISuggestion } from "../types/base";

interface Props {
  suggestions: AISuggestion[];
  visible: boolean;
  loading: boolean;
  onClose: () => void;
}

const ICONS = { info: "ℹ️", warning: "⚠️", success: "✅" };
const COLORS = {
  info: { bg: "#0f2744", border: "#1d4ed8", text: "#93c5fd" },
  warning: { bg: "#2d1f00", border: "#92400e", text: "#fcd34d" },
  success: { bg: "#052e16", border: "#166534", text: "#86efac" },
};

export default function AIPanel({
  suggestions,
  visible,
  loading,
  onClose,
}: Props) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 208,
        bottom: 16,
        width: 320,
        background: "#0d1117",
        border: "1px solid #312e81",
        borderRadius: 12,
        zIndex: 10,
        overflow: "hidden",
      }}>
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#a78bfa",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: 1,
          }}>
          ✦ AI ANALYSIS
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            fontSize: 16,
          }}>
          ×
        </button>
      </div>

      <div
        style={{
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
        {loading ? (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              color: "#475569",
              fontSize: 13,
            }}>
            Analysing architecture...
          </div>
        ) : (
          suggestions.map((s, i) => {
            const c = COLORS[s.type];
            return (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                }}>
                <div
                  style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14 }}>{ICONS[s.type]}</span>
                  <div style={{ fontSize: 12, color: c.text, lineHeight: 1.6 }}>
                    {s.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div
          style={{
            fontSize: 10,
            color: "#334155",
            paddingTop: 4,
            lineHeight: 1.5,
          }}>
          Connect Claude API key in backend/routes/ai.py for full AI analysis
        </div>
      </div>
    </div>
  );
}
