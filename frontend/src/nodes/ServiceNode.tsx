import { Handle, Position, type NodeProps } from "reactflow";
import type { ServiceType } from "../types/base";
import { SERVICE_CONFIGS } from "../static/data";

interface ServiceNodeData {
  label: string;
  serviceType: ServiceType;
  port?: number;
  deploying?: boolean;
  deployed?: boolean;
}

export default function ServiceNode({
  data,
  selected,
}: NodeProps<ServiceNodeData>) {
  const cfg = SERVICE_CONFIGS[data.serviceType] || SERVICE_CONFIGS.api;
  const isDeploying = data.deploying;
  const isDeployed = data.deployed;

  return (
    <div
      className={isDeploying ? "node-deploying" : ""}
      style={{
        background: cfg.color,
        border: `1.5px solid ${isDeployed ? "#22c55e" : selected ? cfg.border : cfg.border + "88"}`,
        borderRadius: 12,
        padding: "12px 16px",
        minWidth: 140,
        cursor: "grab",
        position: "relative",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: selected
          ? `0 0 16px ${cfg.glow}`
          : isDeployed
            ? "0 0 12px rgba(34,197,94,0.4)"
            : "none",
      }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{cfg.icon}</span>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#f1f5f9",
              fontFamily: "JetBrains Mono, monospace",
            }}>
            {data.label}
          </div>
          <div
            style={{
              fontSize: 10,
              color: cfg.border,
              marginTop: 2,
              fontFamily: "JetBrains Mono, monospace",
            }}>
            {data.serviceType}
            {data.port ? `:${data.port}` : ""}
          </div>
        </div>
        {isDeployed && (
          <div
            style={{
              marginLeft: "auto",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
        )}
      </div>
    </div>
  );
}
