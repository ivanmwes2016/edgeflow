import type { SimStep } from "../types/base";

interface Props {
  steps: SimStep[];
  currentStep: number;
  visible: boolean;
  onClose: () => void;
}

export default function SimPanel({
  steps,
  currentStep,
  visible,
  onClose,
}: Props) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        top: 68,
        bottom: 16,
        width: 300,
        background: "#0d1117",
        border: "1px solid #1e293b",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
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
            color: "#38bdf8",
            fontFamily: "JetBrains Mono, monospace",
            letterSpacing: 1,
          }}>
          DEPLOYMENT LOG
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
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}>
        {steps.slice(0, currentStep + 1).map((step, idx) => (
          <div
            key={idx}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              background: idx === currentStep ? "#0f2744" : "#111827",
              border: `1px solid ${step.status === "success" ? "#166534" : idx === currentStep ? "#1d4ed8" : "#1e293b"}`,
              opacity: idx < currentStep ? 0.7 : 1,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10 }}>
                {step.status === "success"
                  ? "✅"
                  : idx === currentStep
                    ? "🔄"
                    : "⏳"}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#94a3b8",
                  fontFamily: "JetBrains Mono, monospace",
                }}>
                {step.nodeLabel}
              </span>
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#e2e8f0",
                marginTop: 3,
                marginLeft: 22,
              }}>
              {step.message}
            </div>
          </div>
        ))}

        {currentStep >= steps.length - 1 && steps.length > 0 && (
          <div
            style={{
              padding: "10px",
              borderRadius: 6,
              background: "#052e16",
              border: "1px solid #166534",
              marginTop: 4,
            }}>
            <div style={{ fontSize: 12, color: "#86efac", fontWeight: 500 }}>
              ✅ All services deployed successfully
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "8px 12px", borderTop: "1px solid #1e293b" }}>
        <div
          style={{
            height: 3,
            background: "#1e293b",
            borderRadius: 2,
            overflow: "hidden",
          }}>
          <div
            style={{
              height: "100%",
              background: "#38bdf8",
              borderRadius: 2,
              width: `${steps.length ? Math.round(((currentStep + 1) / steps.length) * 100) : 0}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#475569",
            marginTop: 4,
            fontFamily: "JetBrains Mono, monospace",
          }}>
          {steps.length
            ? Math.round(((currentStep + 1) / steps.length) * 100)
            : 0}
          % complete
        </div>
      </div>
    </div>
  );
}
