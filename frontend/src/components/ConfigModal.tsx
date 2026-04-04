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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}>
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #1e293b",
          borderRadius: 14,
          width: 600,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#86efac",
              fontFamily: "JetBrains Mono, monospace",
            }}>
            docker-compose.yml
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCopy}
              style={{
                padding: "5px 12px",
                background: "#1e293b",
                border: "none",
                borderRadius: 6,
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: 12,
              }}>
              Copy
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding: "5px 12px",
                background: "#14532d",
                border: "none",
                borderRadius: 6,
                color: "#86efac",
                cursor: "pointer",
                fontSize: 12,
              }}>
              Download
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                fontSize: 18,
              }}>
              ×
            </button>
          </div>
        </div>
        <pre
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
            margin: 0,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 12,
            color: "#e2e8f0",
            lineHeight: 1.7,
          }}>
          {yaml}
        </pre>
      </div>
    </div>
  );
}
